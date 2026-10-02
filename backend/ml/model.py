"""
Agent 3: ML Engine — Multi-modal Nowcasting Model
Architecture: per-source CNN encoders -> cross-attention fusion -> U-Net + ConvLSTM -> multi-head outputs
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
from typing import Optional, Tuple, Dict, List


# ============================================================
# Channel groups (must match data_pipeline/main.py CHANNEL_ORDER)
# ============================================================
RADAR_CHANNELS = [0, 1]          # reflectivity_dbz, beam_blockage_mask
SAT_CHANNELS = [2, 3, 4, 5, 6]  # VIS, IR10.8, WV6.2, BT_diff, OST
LIGHTNING_CHANNELS = [7, 8]     # counts, energy
NWP_CHANNELS = [9, 10, 11, 12, 13, 14, 15, 16]  # CAPE, CIN, LI, TCWV, K, shear, FL, RH850
N_TOTAL_CHANNELS = 17


# ============================================================
# Encoder Blocks
# ============================================================

class ConvBNReLU(nn.Sequential):
    def __init__(self, in_ch, out_ch, k=3, stride=1, groups=1):
        super().__init__(
            nn.Conv2d(in_ch, out_ch, k, padding=k // 2, stride=stride, groups=groups, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.GELU(),
        )


class ResBlock(nn.Module):
    def __init__(self, ch: int, dropout: float = 0.1):
        super().__init__()
        self.net = nn.Sequential(
            ConvBNReLU(ch, ch),
            nn.Dropout2d(dropout),
            ConvBNReLU(ch, ch),
        )

    def forward(self, x):
        return x + self.net(x)


class SourceEncoder(nn.Module):
    """
    Per-source CNN encoder. Takes (B, T, C_src, H, W) and produces (B, T, D, H/4, W/4).
    """
    def __init__(self, in_channels: int, embed_dim: int = 64, dropout: float = 0.1):
        super().__init__()
        self.embed_dim = embed_dim
        self.encoder = nn.Sequential(
            ConvBNReLU(in_channels, embed_dim, k=7),
            ResBlock(embed_dim, dropout),
            ConvBNReLU(embed_dim, embed_dim * 2, stride=2),   # /2
            ResBlock(embed_dim * 2, dropout),
            ConvBNReLU(embed_dim * 2, embed_dim * 2, stride=2),  # /4
            ResBlock(embed_dim * 2, dropout),
        )
        self.out_dim = embed_dim * 2

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """x: (B*T, C_src, H, W) -> (B*T, D, h, w)"""
        return self.encoder(x)


# ============================================================
# Cross-Attention Fusion
# ============================================================

class MultiSourceFusion(nn.Module):
    """
    Cross-attention fusion of multiple source embeddings.
    Each source token attends to all others.
    Input: list of (B*T, D, h, w) tensors, one per source
    Output: fused (B*T, D_fused, h, w)
    """
    def __init__(self, source_dims: List[int], fused_dim: int = 128, n_heads: int = 4):
        super().__init__()
        self.fused_dim = fused_dim

        # Project each source to common dim
        self.projs = nn.ModuleList([
            nn.Conv2d(d, fused_dim, 1) for d in source_dims
        ])
        self.n_sources = len(source_dims)

        # Cross-attention
        self.attn = nn.MultiheadAttention(fused_dim, n_heads, batch_first=True, dropout=0.1)
        self.norm = nn.LayerNorm(fused_dim)

        # Weighted sum for missing modality dropout
        self.source_weights = nn.Parameter(torch.ones(self.n_sources))

        self.out_proj = nn.Sequential(
            nn.Conv2d(fused_dim, fused_dim, 3, padding=1),
            nn.GELU(),
        )

    def forward(
        self,
        source_feats: List[torch.Tensor],
        missing_mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """
        source_feats: list of (B*T, D_i, h, w)
        missing_mask: (B*T, n_sources) bool tensor, True = source missing
        """
        B, _, h, w = source_feats[0].shape

        # Project all sources to fused_dim
        projected = [proj(feat) for proj, feat in zip(self.projs, source_feats)]

        # Flatten spatial: (B*T, n_src, D)
        tokens = torch.stack([p.flatten(2).permute(0, 2, 1) for p in projected], dim=1)
        B_T, n_src, hw, D = tokens.shape
        tokens_flat = tokens.view(B_T, n_src * hw, D)

        # Apply missing mask (zero out missing sources)
        weights = F.softmax(self.source_weights, dim=0)  # (n_src,)
        if missing_mask is not None:
            for i in range(self.n_sources):
                mask_i = missing_mask[:, i].float().view(-1, 1, 1)  # (B*T, 1, 1)
                tokens[:, i] = tokens[:, i] * (1 - mask_i)

        # Cross-attention (query = all tokens attending to all tokens)
        attn_out, _ = self.attn(tokens_flat, tokens_flat, tokens_flat)
        attn_out = self.norm(attn_out + tokens_flat)

        # Weighted sum across source groups
        attn_out = attn_out.view(B_T, n_src, hw, D)
        fused = (attn_out * weights.view(1, n_src, 1, 1)).sum(dim=1)  # (B*T, hw, D)
        fused = fused.permute(0, 2, 1).view(B_T, D, h, w)

        return self.out_proj(fused)


# ============================================================
# ConvLSTM
# ============================================================

class ConvLSTMCell(nn.Module):
    def __init__(self, in_channels: int, hidden_channels: int, kernel_size: int = 3):
        super().__init__()
        self.h = hidden_channels
        self.conv = nn.Conv2d(
            in_channels + hidden_channels, 4 * hidden_channels,
            kernel_size, padding=kernel_size // 2,
        )

    def forward(self, x: torch.Tensor, state: Tuple[torch.Tensor, torch.Tensor]):
        h, c = state
        gates = self.conv(torch.cat([x, h], dim=1))
        i, f, g, o = gates.chunk(4, dim=1)
        c = F.sigmoid(f) * c + F.sigmoid(i) * torch.tanh(g)
        h = F.sigmoid(o) * torch.tanh(c)
        return h, c

    def init_state(self, x: torch.Tensor):
        B, _, H, W = x.shape
        zeros = torch.zeros(B, self.h, H, W, device=x.device, dtype=x.dtype)
        return zeros, zeros


class ConvLSTM(nn.Module):
    def __init__(self, in_channels: int, hidden_channels: int, n_layers: int = 2):
        super().__init__()
        self.cells = nn.ModuleList([
            ConvLSTMCell(
                in_channels if i == 0 else hidden_channels,
                hidden_channels,
            ) for i in range(n_layers)
        ])

    def forward(self, x_seq: torch.Tensor) -> torch.Tensor:
        """x_seq: (B, T, C, H, W) -> output: (B, T, hidden_channels, H, W)"""
        B, T, C, H, W = x_seq.shape
        states = [cell.init_state(x_seq[:, 0]) for cell in self.cells]
        outputs = []
        for t in range(T):
            h = x_seq[:, t]
            for i, cell in enumerate(self.cells):
                h, states[i] = cell(h, states[i])
                states[i] = (h, states[i][1])
            outputs.append(h)
        return torch.stack(outputs, dim=1)


# ============================================================
# U-Net Skip Connection Core
# ============================================================

class UNetEncoder(nn.Module):
    def __init__(self, in_ch: int, base_ch: int = 64):
        super().__init__()
        self.down1 = nn.Sequential(ConvBNReLU(in_ch, base_ch), ResBlock(base_ch))
        self.down2 = nn.Sequential(nn.MaxPool2d(2), ConvBNReLU(base_ch, base_ch * 2), ResBlock(base_ch * 2))
        self.down3 = nn.Sequential(nn.MaxPool2d(2), ConvBNReLU(base_ch * 2, base_ch * 4), ResBlock(base_ch * 4))
        self.bottleneck = nn.Sequential(nn.MaxPool2d(2), ConvBNReLU(base_ch * 4, base_ch * 8), ResBlock(base_ch * 8))
        self.out_ch = base_ch * 8

    def forward(self, x):
        s1 = self.down1(x)
        s2 = self.down2(s1)
        s3 = self.down3(s2)
        b = self.bottleneck(s3)
        return b, [s1, s2, s3]


class UNetDecoder(nn.Module):
    def __init__(self, base_ch: int = 64, out_ch: int = 64):
        super().__init__()
        self.up3 = nn.ConvTranspose2d(base_ch * 8, base_ch * 4, 2, stride=2)
        self.conv3 = nn.Sequential(ConvBNReLU(base_ch * 8, base_ch * 4), ResBlock(base_ch * 4))
        self.up2 = nn.ConvTranspose2d(base_ch * 4, base_ch * 2, 2, stride=2)
        self.conv2 = nn.Sequential(ConvBNReLU(base_ch * 4, base_ch * 2), ResBlock(base_ch * 2))
        self.up1 = nn.ConvTranspose2d(base_ch * 2, base_ch, 2, stride=2)
        self.conv1 = nn.Sequential(ConvBNReLU(base_ch * 2, base_ch), ResBlock(base_ch))
        self.final = nn.Conv2d(base_ch, out_ch, 1)

    def forward(self, bottleneck, skips):
        s1, s2, s3 = skips
        x = self.up3(bottleneck)
        x = self.conv3(torch.cat([x, s3], dim=1))
        x = self.up2(x)
        x = self.conv2(torch.cat([x, s2], dim=1))
        x = self.up1(x)
        x = self.conv1(torch.cat([x, s1], dim=1))
        return self.final(x)


# ============================================================
# Prediction Heads
# ============================================================

class ReflectivityHead(nn.Module):
    """Predict reflectivity fields at +10..+180 min (18 lead times)."""
    def __init__(self, in_ch: int, n_lead: int = 18, n_ensemble: int = 5):
        super().__init__()
        self.n_lead = n_lead
        self.n_ensemble = n_ensemble
        self.mean_head = nn.Conv2d(in_ch, n_lead, 1)
        self.std_head = nn.Sequential(nn.Conv2d(in_ch, n_lead, 1), nn.Softplus())

    def forward(self, x) -> Dict[str, torch.Tensor]:
        mean = self.mean_head(x) * 75.0   # scale to dBZ range
        std = self.std_head(x) * 10.0
        return {"reflectivity_mean": mean, "reflectivity_std": std}


class LightningProbHead(nn.Module):
    """Predict lightning probability for 4 lead-time windows."""
    WINDOWS = [(0, 30), (30, 60), (60, 120), (120, 180)]  # minutes

    def __init__(self, in_ch: int):
        super().__init__()
        self.prob_head = nn.Sequential(
            nn.Conv2d(in_ch, 32, 3, padding=1),
            nn.GELU(),
            nn.Conv2d(32, len(self.WINDOWS), 1),
            nn.Sigmoid(),
        )

    def forward(self, x) -> torch.Tensor:
        return self.prob_head(x)  # (B, 4, H, W) in [0,1]


class SeverityHead(nn.Module):
    """Predict storm severity class: 0=none, 1=moderate, 2=severe, 3=extreme."""
    N_CLASSES = 4

    def __init__(self, in_ch: int):
        super().__init__()
        self.head = nn.Sequential(
            nn.AdaptiveAvgPool2d(16),
            nn.Flatten(),
            nn.Linear(in_ch * 16 * 16, 256),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(256, self.N_CLASSES),
        )

    def forward(self, x) -> torch.Tensor:
        return self.head(x)  # (B, 4) logits


# ============================================================
# Full VajraNet Model
# ============================================================

class VajraNet(nn.Module):
    """
    VajraNet: Full multi-modal nowcasting model.
    Input: (B, T, N_TOTAL_CHANNELS, H, W) + missing_mask (B, T, 4)
    Outputs: reflectivity predictions, lightning probabilities, severity, uncertainty
    """

    def __init__(
        self,
        embed_dim: int = 64,
        fused_dim: int = 128,
        lstm_hidden: int = 128,
        n_lead_times: int = 18,  # +10..+180 min at 10-min steps
        dropout: float = 0.1,
    ):
        super().__init__()

        # Per-source encoders
        self.radar_enc = SourceEncoder(len(RADAR_CHANNELS), embed_dim, dropout)
        self.sat_enc = SourceEncoder(len(SAT_CHANNELS), embed_dim, dropout)
        self.lightning_enc = SourceEncoder(len(LIGHTNING_CHANNELS), embed_dim // 2, dropout)
        self.nwp_enc = SourceEncoder(len(NWP_CHANNELS), embed_dim, dropout)

        source_dims = [
            self.radar_enc.out_dim,
            self.sat_enc.out_dim,
            self.lightning_enc.out_dim,
            self.nwp_enc.out_dim,
        ]

        # Fusion
        self.fusion = MultiSourceFusion(source_dims, fused_dim, n_heads=4)

        # Spatio-temporal core
        self.convlstm = ConvLSTM(fused_dim, lstm_hidden, n_layers=2)
        self.unet_enc = UNetEncoder(lstm_hidden, base_ch=64)
        self.unet_dec = UNetDecoder(base_ch=64, out_ch=64)

        # Prediction heads
        self.refl_head = ReflectivityHead(64, n_lead_times)
        self.lightning_head = LightningProbHead(64)
        self.severity_head = SeverityHead(64)

        # Explainability: channel importance weights (learned)
        self.channel_importance = nn.Parameter(torch.ones(N_TOTAL_CHANNELS) / N_TOTAL_CHANNELS)

    def forward(
        self,
        x: torch.Tensor,
        missing_mask: Optional[torch.Tensor] = None,
    ) -> Dict[str, torch.Tensor]:
        """
        x: (B, T, C, H, W)
        missing_mask: (B, T, 4) bool — True if source i is missing at time t
        """
        B, T, C, H, W = x.shape
        device = x.device

        if missing_mask is None:
            missing_mask = torch.zeros(B, T, 4, dtype=torch.bool, device=device)

        # ── Normalize inputs ──
        x = self._normalize(x)

        # ── Per-source encoding (flatten B, T) ──
        BT = B * T
        x_flat = x.view(BT, C, H, W)
        mask_flat = missing_mask.view(BT, 4)

        radar_feat = self.radar_enc(x_flat[:, RADAR_CHANNELS])
        sat_feat = self.sat_enc(x_flat[:, SAT_CHANNELS])
        light_feat = self.lightning_enc(x_flat[:, LIGHTNING_CHANNELS])
        nwp_feat = self.nwp_enc(x_flat[:, NWP_CHANNELS])

        # ── Fusion ──
        fused = self.fusion(
            [radar_feat, sat_feat, light_feat, nwp_feat],
            missing_mask=mask_flat,
        )  # (B*T, fused_dim, h4, w4)

        _, D, h4, w4 = fused.shape
        fused_seq = fused.view(B, T, D, h4, w4)

        # ── ConvLSTM temporal processing ──
        lstm_out = self.convlstm(fused_seq)  # (B, T, hidden, h4, w4)
        last = lstm_out[:, -1]  # (B, hidden, h4, w4) — last timestep

        # ── U-Net spatial refinement ──
        bottleneck, skips = self.unet_enc(last)
        features = self.unet_dec(bottleneck, skips)  # (B, 64, H, W)

        # ── Upsample if needed ──
        if features.shape[-2:] != (H, W):
            features = F.interpolate(features, size=(H, W), mode="bilinear", align_corners=False)

        # ── Prediction heads ──
        refl_out = self.refl_head(features)
        lightning_prob = self.lightning_head(features)
        severity_logits = self.severity_head(features)

        # ── Channel importance for explainability ──
        importance = F.softmax(self.channel_importance, dim=0)

        return {
            "reflectivity_mean": refl_out["reflectivity_mean"],   # (B, n_lead, H, W)
            "reflectivity_std": refl_out["reflectivity_std"],     # (B, n_lead, H, W)
            "lightning_prob": lightning_prob,                     # (B, 4, H, W)
            "severity_logits": severity_logits,                   # (B, 4)
            "channel_importance": importance,                     # (C,)
        }

    def _normalize(self, x: torch.Tensor) -> torch.Tensor:
        """Per-channel normalization (fixed statistics)."""
        # Approximate means/stds for each channel (production: compute from dataset)
        means = torch.tensor(
            [15.0, 0.1,   # radar
             0.3, 5.0, -5.0, 1.5, 0.05,   # satellite
             0.5, 0.3,   # lightning
             800, -80, -2, 45, 20, 15, 4500, 70],  # NWP
            device=x.device, dtype=x.dtype
        )
        stds = torch.tensor(
            [20.0, 0.3,
             0.2, 25.0, 15.0, 3.0, 0.2,
             2.0, 1.5,
             800, 60, 3, 15, 10, 10, 500, 20],
            device=x.device, dtype=x.dtype
        )
        means = means.view(1, 1, -1, 1, 1)
        stds = stds.view(1, 1, -1, 1, 1)
        x = (x - means) / (stds + 1e-6)
        # Replace NaN (missing values) with 0 after normalization
        x = torch.nan_to_num(x, nan=0.0)
        return x

    def get_saliency(self, x: torch.Tensor, missing_mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        """Compute input gradient saliency map for explainability."""
        x = x.detach().requires_grad_(True)
        outputs = self(x, missing_mask)
        target = outputs["lightning_prob"].mean()
        target.backward()
        saliency = x.grad.abs().mean(dim=[0, 1, 3, 4])  # (C,)
        return saliency
