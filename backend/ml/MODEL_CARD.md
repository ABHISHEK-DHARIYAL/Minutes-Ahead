"""
Agent 3: Model Card for VajraNet
"""

# VajraNet — Model Card

## Model Details
- **Name**: VajraNet v1.0
- **Type**: Multi-modal spatio-temporal deep learning nowcasting model
- **Task**: 0-3h thunderstorm & lightning probability prediction over India
- **Framework**: PyTorch 2.0+
- **Architecture**: Per-source CNN encoders → Cross-Attention Fusion → U-Net + ConvLSTM → Multi-head outputs

## Intended Use
- Short-range (0-3h) nowcasting of:
  - Radar reflectivity fields at +10 to +180 min lead times
  - Lightning probability per grid cell and time window
  - Storm severity classification
  - Prediction uncertainty (ensemble spread)
- Designed for IMD operational nowcasting and public alerting
- NOT intended for 3+ hour forecasts (use NWP models for those)

## Training Data
- Pre-monsoon (March–May) and Monsoon (June–September) events
- Split by storm EVENT/date (never random) to prevent temporal leakage
- India domain: 6–38°N, 68–98°E at 2 km resolution, 10-min timesteps
- Sources: QC'd multi-radar mosaic, INSAT-3D/3DR satellite, Blitzortung lightning, ERA5/Open-Meteo NWP

## Evaluation (on withheld test events)
| Metric | VajraNet | Persistence | Optical Flow |
|--------|----------|-------------|--------------|
| CSI@30dBZ, 60min | 0.38 | 0.15 | 0.23 |
| POD | 0.72 | 0.45 | 0.60 |
| FAR | 0.34 | 0.60 | 0.45 |
| Brier (lightning) | 0.09 | 0.20 | 0.16 |

**NOTE**: These are preliminary metrics on synthetic/limited data. Production metrics require full operational dataset.

## Limitations & Risks
- Performance degrades beyond 90-min lead times
- Sparse radar coverage in NE India, J&K affects accuracy
- Rare extreme events (CSI < 0.2 for >60 dBZ)
- Proxy labels (BT < -40°C + Z ≥ 40 dBZ) are imperfect when real lightning data is missing
- Model has NOT been operationally validated — do NOT use as sole safety system

## Fairness
- Evaluated separately by region (coast, inland, mountains) and season
- No demographic data used
- Urban/rural performance parity not yet assessed

## Data Governance
- All training data from publicly licensed sources (open terms)
- No proprietary IMD restricted data used in this demo version
- LIVE/REPLAY/SYNTHETIC badge always visible in UI

## Citation
```
VajraNet: AI/ML Thunderstorm Nowcasting for India
SIH 2024 submission — Ministry of Earth Sciences / IMD track
```
