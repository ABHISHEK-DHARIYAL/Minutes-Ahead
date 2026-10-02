"""
Agent 3: ML Engine — Training Pipeline
Handles: dataset splitting by storm event, losses, evaluation metrics, MLflow tracking
"""

import os
import sys
import json
import math
import logging
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, Tuple, List

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from torch.cuda.amp import autocast, GradScaler

try:
    import mlflow
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False
    logging.warning("MLflow not available; experiment tracking disabled")

from model import VajraNet, N_TOTAL_CHANNELS

logger = logging.getLogger("ml.trainer")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


# ============================================================
# Dataset (by storm EVENT to avoid leakage)
# ============================================================

class NowcastingDataset(Dataset):
    """
    Nowcasting dataset split by storm EVENT (never by random index).
    Each sample: (input_tensor, target_reflectivity, target_lightning, target_severity)
    """

    def __init__(
        self,
        data_dir: str,
        split: str = "train",  # train/val/test
        n_input_steps: int = 6,   # 60 minutes of history
        n_lead_times: int = 18,   # 180 minutes of forecast
        modality_dropout_prob: float = 0.3,  # prob of dropping a source during training
        augment: bool = True,
    ):
        self.data_dir = Path(data_dir)
        self.split = split
        self.n_input_steps = n_input_steps
        self.n_lead_times = n_lead_times
        self.modality_dropout_prob = modality_dropout_prob
        self.augment = augment and (split == "train")

        # Load event index (created by data preparation script)
        event_index_path = self.data_dir / "event_index.json"
        if event_index_path.exists():
            with open(event_index_path) as f:
                self.event_index = json.load(f)
        else:
            # Generate synthetic index for testing
            self.event_index = self._generate_synthetic_index()

        # Split by events (chronological)
        events = sorted(self.event_index.keys())
        n = len(events)
        if split == "train":
            selected = events[:int(n * 0.7)]
        elif split == "val":
            selected = events[int(n * 0.7):int(n * 0.85)]
        else:
            selected = events[int(n * 0.85):]

        self.samples = []
        for ev in selected:
            self.samples.extend(self.event_index[ev])

        logger.info(f"Dataset [{split}]: {len(self.samples)} samples from {len(selected)} events")

    def _generate_synthetic_index(self) -> Dict:
        """Generate a synthetic index for development/testing."""
        index = {}
        for i in range(50):
            event_id = f"event_{i:03d}"
            index[event_id] = [
                {"id": f"{event_id}_t{t}", "synthetic": True}
                for t in range(10)
            ]
        return index

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, ...]:
        sample_info = self.samples[idx]
        synthetic = sample_info.get("synthetic", False)

        if synthetic:
            return self._generate_synthetic_sample()

        # Load real data
        try:
            sample_path = self.data_dir / "samples" / f"{sample_info['id']}.npz"
            data = np.load(sample_path)
            x = torch.from_numpy(data["input"]).float()    # (T, C, H, W)
            y_refl = torch.from_numpy(data["target_refl"]).float()    # (n_lead, H, W)
            y_light = torch.from_numpy(data["target_light"]).float()  # (4, H, W)
            y_sev = torch.from_numpy(data["target_severity"]).long()  # (,)
            missing = torch.from_numpy(data["missing_mask"]).bool()   # (T, 4)
        except Exception:
            return self._generate_synthetic_sample()

        if self.augment:
            x, y_refl, y_light, missing = self._augment(x, y_refl, y_light, missing)

        if self.split == "train":
            missing = self._apply_modality_dropout(missing)

        return x, y_refl, y_light, y_sev, missing

    def _generate_synthetic_sample(self):
        """Generate a realistic synthetic training sample."""
        T = self.n_input_steps
        H, W = 64, 64  # reduced size for small-data mode; full = (ny, nx)
        C = N_TOTAL_CHANNELS
        L = self.n_lead_times

        # Input: (T, C, H, W)
        x = torch.randn(T, C, H, W) * 0.5
        # Make radar channel more structured
        for t in range(T):
            cx, cy = H // 2, W // 2
            y_, x_ = torch.meshgrid(torch.arange(H), torch.arange(W), indexing="ij")
            dist = ((y_ - cy) ** 2 + (x_ - cx) ** 2).float().sqrt()
            storm = 40 * torch.exp(-dist ** 2 / (2 * 15 ** 2)) + torch.randn(H, W) * 3
            x[t, 0] = storm  # reflectivity channel

        y_refl = torch.rand(L, H, W) * 50  # (n_lead, H, W)
        y_light = torch.rand(4, H, W)      # (4 windows, H, W) probabilities
        y_sev = torch.randint(0, 4, ())
        missing = torch.zeros(T, 4, dtype=torch.bool)

        # Randomly drop some sources
        if self.split == "train":
            missing = self._apply_modality_dropout(missing)

        return x, y_refl, y_light, y_sev, missing

    def _augment(self, x, y_refl, y_light, missing):
        """Data augmentation: random flip, rotation."""
        if torch.rand(1) > 0.5:
            x = torch.flip(x, dims=[-1])
            y_refl = torch.flip(y_refl, dims=[-1])
            y_light = torch.flip(y_light, dims=[-1])
        if torch.rand(1) > 0.5:
            x = torch.flip(x, dims=[-2])
            y_refl = torch.flip(y_refl, dims=[-2])
            y_light = torch.flip(y_light, dims=[-2])
        return x, y_refl, y_light, missing

    def _apply_modality_dropout(self, missing: torch.Tensor) -> torch.Tensor:
        """Randomly drop sources to make model robust to missing inputs."""
        for src_idx in range(4):
            if torch.rand(1) < self.modality_dropout_prob:
                missing[:, src_idx] = True
        return missing


# ============================================================
# Loss Functions
# ============================================================

def ssim_loss(pred: torch.Tensor, target: torch.Tensor, window_size: int = 7) -> torch.Tensor:
    """Simplified SSIM loss for reflectivity fields."""
    C1, C2 = 0.01 ** 2, 0.03 ** 2
    mu_p = F.avg_pool2d(pred, window_size, 1, window_size // 2)
    mu_t = F.avg_pool2d(target, window_size, 1, window_size // 2)
    sigma_p = F.avg_pool2d(pred ** 2, window_size, 1, window_size // 2) - mu_p ** 2
    sigma_t = F.avg_pool2d(target ** 2, window_size, 1, window_size // 2) - mu_t ** 2
    sigma_pt = F.avg_pool2d(pred * target, window_size, 1, window_size // 2) - mu_p * mu_t
    ssim_map = ((2 * mu_p * mu_t + C1) * (2 * sigma_pt + C2)) / (
        (mu_p ** 2 + mu_t ** 2 + C1) * (sigma_p + sigma_t + C2)
    )
    return 1.0 - ssim_map.mean()


def focal_loss(pred: torch.Tensor, target: torch.Tensor, gamma: float = 2.0) -> torch.Tensor:
    """Focal loss for imbalanced lightning prediction."""
    bce = F.binary_cross_entropy(pred, target, reduction="none")
    p_t = pred * target + (1 - pred) * (1 - target)
    fl = ((1 - p_t) ** gamma) * bce
    return fl.mean()


def combined_reflectivity_loss(
    pred_mean: torch.Tensor,
    pred_std: torch.Tensor,
    target: torch.Tensor,
    mse_weight: float = 0.6,
    ssim_weight: float = 0.4,
) -> torch.Tensor:
    """MSE + SSIM + NLL for probabilistic reflectivity prediction."""
    B, L, H, W = pred_mean.shape
    target_exp = target[:, :L]  # match lead times

    mse = F.mse_loss(pred_mean, target_exp)
    ssim = ssim_loss(pred_mean.reshape(-1, 1, H, W), target_exp.reshape(-1, 1, H, W))
    # Negative log-likelihood for Gaussian uncertainty
    nll = (((target_exp - pred_mean) ** 2) / (2 * pred_std ** 2 + 1e-6) + torch.log(pred_std + 1e-6)).mean()

    return mse_weight * mse + ssim_weight * ssim + 0.1 * nll


# ============================================================
# Evaluation Metrics
# ============================================================

def compute_metrics(
    pred_refl: np.ndarray,
    target_refl: np.ndarray,
    pred_lightning: np.ndarray,
    target_lightning: np.ndarray,
    thresholds: List[float] = [20.0, 30.0, 40.0],
) -> Dict[str, float]:
    """Compute POD, FAR, CSI, HSS, ETS, Brier score per threshold."""
    metrics = {}

    for thr in thresholds:
        pred_bin = (pred_refl >= thr).astype(np.float32)
        obs_bin = (target_refl >= thr).astype(np.float32)

        tp = (pred_bin * obs_bin).sum()
        fp = (pred_bin * (1 - obs_bin)).sum()
        fn = ((1 - pred_bin) * obs_bin).sum()
        tn = ((1 - pred_bin) * (1 - obs_bin)).sum()

        eps = 1e-6
        pod = tp / (tp + fn + eps)
        far = fp / (tp + fp + eps)
        csi = tp / (tp + fp + fn + eps)

        # HSS
        num = 2 * (tp * tn - fp * fn)
        den = (tp + fn) * (fn + tn) + (tp + fp) * (fp + tn)
        hss = num / (den + eps)

        # ETS (Equitable Threat Score)
        hits_random = (tp + fp) * (tp + fn) / (tp + fp + fn + tn + eps)
        ets = (tp - hits_random) / (tp + fp + fn - hits_random + eps)

        metrics[f"POD_{thr:.0f}dBZ"] = float(pod)
        metrics[f"FAR_{thr:.0f}dBZ"] = float(far)
        metrics[f"CSI_{thr:.0f}dBZ"] = float(csi)
        metrics[f"HSS_{thr:.0f}dBZ"] = float(hss)
        metrics[f"ETS_{thr:.0f}dBZ"] = float(ets)

    # Brier score for lightning
    brier = np.mean((pred_lightning - target_lightning) ** 2)
    metrics["Brier"] = float(brier)

    # CRPS (simplified as MAE of ensemble mean)
    metrics["CRPS"] = float(np.abs(pred_refl - target_refl).mean())

    return metrics


# ============================================================
# Trainer
# ============================================================

class Trainer:
    def __init__(self, config: Dict):
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Training device: {self.device}")

        self.model = VajraNet(
            embed_dim=config.get("embed_dim", 64),
            fused_dim=config.get("fused_dim", 128),
            lstm_hidden=config.get("lstm_hidden", 128),
        ).to(self.device)

        self.optimizer = torch.optim.AdamW(
            self.model.parameters(),
            lr=config.get("lr", 1e-3),
            weight_decay=config.get("weight_decay", 1e-4),
        )

        self.scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
            self.optimizer, T_max=config.get("epochs", 50)
        )
        self.scaler = GradScaler(enabled=self.device.type == "cuda")

        self.best_val_csi = -1.0
        self.patience_counter = 0

    def train_epoch(self, loader: DataLoader) -> Dict[str, float]:
        self.model.train()
        losses = {"total": 0.0, "refl": 0.0, "lightning": 0.0, "severity": 0.0}
        n = 0

        for batch in loader:
            x, y_refl, y_light, y_sev, missing = [b.to(self.device) for b in batch]

            self.optimizer.zero_grad()
            with autocast(enabled=self.device.type == "cuda"):
                outputs = self.model(x, missing)

                loss_refl = combined_reflectivity_loss(
                    outputs["reflectivity_mean"], outputs["reflectivity_std"], y_refl
                )
                loss_light = focal_loss(outputs["lightning_prob"], y_light)
                loss_sev = F.cross_entropy(
                    outputs["severity_logits"],
                    y_sev,
                    weight=torch.tensor([1.0, 2.0, 4.0, 8.0], device=self.device),
                )
                loss = (
                    self.config.get("w_refl", 0.5) * loss_refl
                    + self.config.get("w_light", 0.4) * loss_light
                    + self.config.get("w_sev", 0.1) * loss_sev
                )

            self.scaler.scale(loss).backward()
            self.scaler.unscale_(self.optimizer)
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            self.scaler.step(self.optimizer)
            self.scaler.update()

            losses["total"] += loss.item()
            losses["refl"] += loss_refl.item()
            losses["lightning"] += loss_light.item()
            losses["severity"] += loss_sev.item()
            n += 1

        return {k: v / max(n, 1) for k, v in losses.items()}

    @torch.no_grad()
    def evaluate(self, loader: DataLoader) -> Dict[str, float]:
        self.model.eval()
        all_pred_refl, all_tgt_refl = [], []
        all_pred_light, all_tgt_light = [], []

        for batch in loader:
            x, y_refl, y_light, y_sev, missing = [b.to(self.device) for b in batch]
            with autocast(enabled=self.device.type == "cuda"):
                outputs = self.model(x, missing)

            all_pred_refl.append(outputs["reflectivity_mean"][:, 5].cpu().numpy())  # 60-min lead
            all_tgt_refl.append(y_refl[:, 5].cpu().numpy() if y_refl.shape[1] > 5 else y_refl[:, -1].cpu().numpy())
            all_pred_light.append(outputs["lightning_prob"][:, 1].cpu().numpy())  # 30-60min window
            all_tgt_light.append(y_light[:, 1].cpu().numpy())

        pred_refl = np.concatenate(all_pred_refl)
        tgt_refl = np.concatenate(all_tgt_refl)
        pred_light = np.concatenate(all_pred_light)
        tgt_light = np.concatenate(all_tgt_light)

        return compute_metrics(pred_refl, tgt_refl, pred_light, tgt_light)

    def train(self, data_dir: str):
        """Full training loop."""
        train_ds = NowcastingDataset(data_dir, "train", augment=True)
        val_ds = NowcastingDataset(data_dir, "val", augment=False)

        train_loader = DataLoader(train_ds, batch_size=self.config.get("batch_size", 4),
                                  shuffle=True, num_workers=0, pin_memory=True)
        val_loader = DataLoader(val_ds, batch_size=self.config.get("batch_size", 4),
                                shuffle=False, num_workers=0)

        if MLFLOW_AVAILABLE:
            mlflow.set_experiment("vajranet_nowcasting")
            run = mlflow.start_run(run_name=f"run_{datetime.now().strftime('%Y%m%d_%H%M')}")
            mlflow.log_params(self.config)

        best_path = Path(self.config.get("output_dir", "checkpoints")) / "best_model.pt"
        best_path.parent.mkdir(parents=True, exist_ok=True)

        patience = self.config.get("patience", 10)

        for epoch in range(1, self.config.get("epochs", 50) + 1):
            train_losses = self.train_epoch(train_loader)
            val_metrics = self.evaluate(val_loader)
            self.scheduler.step()

            csi = val_metrics.get("CSI_30dBZ", 0.0)
            logger.info(
                f"Epoch {epoch:3d} | "
                f"Loss: {train_losses['total']:.4f} | "
                f"CSI@30dBZ: {csi:.4f} | "
                f"POD: {val_metrics.get('POD_30dBZ', 0):.4f} | "
                f"FAR: {val_metrics.get('FAR_30dBZ', 0):.4f} | "
                f"Brier: {val_metrics.get('Brier', 0):.4f}"
            )

            if MLFLOW_AVAILABLE:
                mlflow.log_metrics({**train_losses, **val_metrics}, step=epoch)

            if csi > self.best_val_csi:
                self.best_val_csi = csi
                self.patience_counter = 0
                torch.save({
                    "epoch": epoch,
                    "model_state_dict": self.model.state_dict(),
                    "optimizer_state_dict": self.optimizer.state_dict(),
                    "val_metrics": val_metrics,
                    "config": self.config,
                }, best_path)
                logger.info(f"  ✓ Saved best model (CSI={csi:.4f})")
            else:
                self.patience_counter += 1
                if self.patience_counter >= patience:
                    logger.info(f"Early stopping at epoch {epoch}")
                    break

        if MLFLOW_AVAILABLE:
            mlflow.end_run()

        # Export to ONNX
        self._export_onnx(best_path)
        logger.info("Training complete!")

    def _export_onnx(self, checkpoint_path: Path):
        """Export model to ONNX for production serving."""
        try:
            checkpoint = torch.load(checkpoint_path, map_location="cpu")
            self.model.load_state_dict(checkpoint["model_state_dict"])
            self.model.eval().cpu()

            dummy_input = torch.zeros(1, 6, N_TOTAL_CHANNELS, 64, 64)
            dummy_mask = torch.zeros(1, 6, 4, dtype=torch.bool)

            onnx_path = checkpoint_path.parent / "vajranet.onnx"
            torch.onnx.export(
                self.model,
                (dummy_input, dummy_mask),
                onnx_path,
                input_names=["input_tensor", "missing_mask"],
                output_names=["reflectivity_mean", "reflectivity_std", "lightning_prob", "severity_logits"],
                dynamic_axes={"input_tensor": {0: "batch"}, "missing_mask": {0: "batch"}},
                opset_version=17,
            )
            logger.info(f"Exported ONNX model to {onnx_path}")
        except Exception as e:
            logger.warning(f"ONNX export failed (non-critical): {e}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="configs/small_data.yaml")
    parser.add_argument("--data_dir", default="data/processed")
    args = parser.parse_args()

    # Load config
    try:
        import yaml
        with open(args.config) as f:
            config = yaml.safe_load(f)
    except Exception:
        config = {
            "embed_dim": 32, "fused_dim": 64, "lstm_hidden": 64,
            "batch_size": 2, "epochs": 10, "lr": 1e-3,
            "output_dir": "checkpoints", "patience": 5,
        }
        logger.info("Using default small-data config")

    trainer = Trainer(config)
    trainer.train(args.data_dir)


if __name__ == "__main__":
    main()
