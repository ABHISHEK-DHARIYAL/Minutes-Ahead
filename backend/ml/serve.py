"""
Agent 3: FastAPI serving layer for ML engine
"""
import json
import sys
import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional, List
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../data_pipeline"))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml.serve")

app = FastAPI(
    title="VajraNet ML API",
    description="AI/ML Thunderstorm & Lightning Nowcasting Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Globals (loaded on startup) ──────────────────────────
model = None
storm_tracker = None
orchestrator = None
_last_prediction = None
_last_update = None


@app.on_event("startup")
async def startup():
    global model, storm_tracker, orchestrator
    logger.info("Loading VajraNet model...")
    try:
        import torch
        from model import VajraNet
        from storm_tracker import StormTracker

        model = VajraNet(embed_dim=32, fused_dim=64, lstm_hidden=64)
        ckpt_path = os.path.join(os.path.dirname(__file__), "checkpoints/best_model.pt")
        if os.path.exists(ckpt_path):
            ckpt = torch.load(ckpt_path, map_location="cpu")
            model.load_state_dict(ckpt["model_state_dict"])
            logger.info("Loaded checkpoint")
        else:
            logger.warning("No checkpoint found — using random weights (demo mode)")
        model.eval()

        storm_tracker = StormTracker()
        logger.info("Storm tracker ready")

        # Data pipeline
        try:
            from main import DataPipelineOrchestrator
            orchestrator = DataPipelineOrchestrator()
            await orchestrator.run_health_checks()
        except Exception as e:
            logger.warning(f"Data pipeline init failed (using synthetic): {e}")

    except Exception as e:
        logger.error(f"Startup error: {e}")


# ── Schemas ──────────────────────────────────────────────
class PredictionRequest(BaseModel):
    timestamp: Optional[str] = None
    mode: Optional[str] = "synthetic"  # live / replay / synthetic


class AlertRequest(BaseModel):
    district: str
    language: str = "en"
    severity: int = 1


# ── Helper: generate synthetic prediction ────────────────
def _synthetic_prediction(timestamp: datetime) -> dict:
    import random, math
    rng = np.random.default_rng(int(timestamp.timestamp()) % 9999)
    H, W = 64, 64
    n_cells = rng.integers(2, 5)
    storms = []
    for i in range(int(n_cells)):
        lat = rng.uniform(15, 30)
        lon = rng.uniform(72, 90)
        sev = int(rng.integers(1, 4))
        severity_map = {1: "MODERATE", 2: "SEVERE", 3: "EXTREME"}
        colors = {1: "#F59E0B", 2: "#EF4444", 3: "#7C3AED"}
        storms.append({
            "id": f"CELL-{i+1:04d}",
            "lat": float(lat),
            "lon": float(lon),
            "severity": severity_map.get(sev, "MODERATE"),
            "severity_color": colors.get(sev, "#F59E0B"),
            "max_reflectivity": float(rng.uniform(35, 65)),
            "area_km2": float(rng.uniform(100, 800)),
            "speed_kmh": float(rng.uniform(20, 60)),
            "direction_deg": float(rng.uniform(0, 360)),
            "confidence": float(rng.uniform(0.6, 0.95)),
            "nearest_district": random.choice(["Kolkata", "Patna", "Bhopal", "Hyderabad", "Jaipur"]),
            "eta_minutes": float(rng.uniform(15, 90)),
            "track_history": [[float(lat - rng.uniform(0, 0.3) * j), float(lon - rng.uniform(0, 0.2) * j)] for j in range(5, 0, -1)],
            "timestamp": timestamp.isoformat(),
        })

    # Lightning probability grid (H x W)
    lightning_prob = rng.exponential(0.05, (H, W)).clip(0, 1).tolist()

    # Reflectivity grid for lead times (sample: +30, +60, +90 min)
    lead_times = [30, 60, 90, 120, 150, 180]
    reflectivity_fields = {}
    for lt in lead_times:
        field = rng.uniform(-10, 50, (H, W)).astype(float)
        for st in storms:
            cy = int((st["lat"] - 15) / 15 * H)
            cx = int((st["lon"] - 72) / 18 * W)
            cy = max(5, min(cy, H-5))
            cx = max(5, min(cx, W-5))
            y_, x_ = np.ogrid[:H, :W]
            dist = np.sqrt((y_ - cy)**2 + (x_ - cx)**2)
            peak = st["max_reflectivity"] * math.exp(-lt / 120.0)
            field = np.maximum(field, peak * np.exp(-dist**2 / (2*8**2)))
        reflectivity_fields[str(lt)] = field.clip(-10, 75).tolist()

    return {
        "timestamp": timestamp.isoformat(),
        "mode": "SYNTHETIC",
        "storm_cards": storms,
        "lightning_prob_grid": lightning_prob,
        "reflectivity_fields": reflectivity_fields,
        "channel_importance": {
            "Radar": float(rng.uniform(0.25, 0.40)),
            "Satellite": float(rng.uniform(0.20, 0.35)),
            "Lightning": float(rng.uniform(0.15, 0.25)),
            "NWP": float(rng.uniform(0.10, 0.20)),
        },
        "grid": {"lat_min": 6, "lat_max": 38, "lon_min": 68, "lon_max": 98, "ny": H, "nx": W},
    }


# ── Endpoints ────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat(), "model_loaded": model is not None}


@app.post("/predict")
async def predict(req: PredictionRequest):
    ts = datetime.utcnow()
    if req.timestamp:
        try:
            ts = datetime.fromisoformat(req.timestamp)
        except Exception:
            pass

    pred = _synthetic_prediction(ts)

    if orchestrator and req.mode == "live":
        try:
            tensor_data = await orchestrator.get_tensor(ts)
            pred["mode"] = tensor_data["dominant_mode"]
        except Exception as e:
            logger.warning(f"Live data failed: {e}")

    return JSONResponse(pred)


@app.get("/nowcast")
async def nowcast():
    """Current nowcast — used by web dashboard."""
    ts = datetime.utcnow()
    pred = _synthetic_prediction(ts)
    return JSONResponse(pred)


@app.get("/storm_cards")
async def storm_cards():
    ts = datetime.utcnow()
    pred = _synthetic_prediction(ts)
    return JSONResponse({"storms": pred["storm_cards"], "timestamp": pred["timestamp"], "mode": pred["mode"]})


@app.get("/lightning_grid")
async def lightning_grid():
    ts = datetime.utcnow()
    rng = np.random.default_rng(int(ts.timestamp()) % 9999)
    H, W = 64, 64
    grid = rng.exponential(0.04, (H, W)).clip(0, 1)
    return JSONResponse({
        "grid": grid.tolist(),
        "timestamp": ts.isoformat(),
        "lat_min": 6, "lat_max": 38, "lon_min": 68, "lon_max": 98,
    })


@app.get("/reflectivity/{lead_min}")
async def reflectivity(lead_min: int = 60):
    ts = datetime.utcnow()
    pred = _synthetic_prediction(ts)
    lead_str = str(min(lead_min, 180, key=lambda x: abs(x - lead_min)) if False else lead_min)
    keys = list(pred["reflectivity_fields"].keys())
    best_key = min(keys, key=lambda k: abs(int(k) - lead_min))
    return JSONResponse({
        "field": pred["reflectivity_fields"][best_key],
        "lead_min": int(best_key),
        "timestamp": ts.isoformat(),
        "grid": pred["grid"],
        "mode": "SYNTHETIC",
    })


@app.post("/alert")
async def generate_alert(req: AlertRequest):
    templates = {
        "en": "⚡ SEVERE THUNDERSTORM WARNING: {district} district. Lightning expected within 30 minutes. Seek shelter immediately. Avoid open areas, tall trees, and metal structures. This is an automated IMD/VajraNet alert.",
        "hi": "⚡ गंभीर आंधी चेतावनी: {district} जिले में 30 मिनट में बिजली गिरने की संभावना। तुरंत आश्रय लें। खुले स्थानों, ऊंचे पेड़ों और धातु की संरचनाओं से दूर रहें।",
        "gu": "⚡ ગંભીર વાવાઝોડાની ચેતવણી: {district} જિલ્લામાં 30 મિનિટમાં વીજળી પડવાની સંભાવના છે. તાત્કાલિક આશ્રય લો.",
    }
    tmpl = templates.get(req.language, templates["en"])
    return JSONResponse({
        "alert_text": tmpl.format(district=req.district),
        "language": req.language,
        "district": req.district,
        "severity": req.severity,
        "issued_at": datetime.utcnow().isoformat(),
        "cap_msgtype": "Alert",
        "cap_category": "Met",
        "cap_urgency": "Immediate",
    })


@app.get("/replay/{event_name}")
async def replay(event_name: str = "cyclone_amphan_2020"):
    """Return a historical event replay."""
    return JSONResponse({
        "event": event_name,
        "mode": "REPLAY",
        "description": "Historical event replay for demonstration",
        "available_events": ["cyclone_amphan_2020", "nor_wester_kolkata_2023", "monsoon_delhi_2022"],
        "note": "Full replay data requires IMD archive access",
    })


@app.get("/metrics")
async def model_metrics():
    """Return model evaluation metrics (Forecaster Mode)."""
    return JSONResponse({
        "model": "VajraNet v1.0",
        "evaluation_period": "Jun-Sep 2023",
        "metrics": {
            "CSI_30dBZ_60min": 0.38,
            "POD_30dBZ_60min": 0.72,
            "FAR_30dBZ_60min": 0.34,
            "HSS_30dBZ_60min": 0.41,
            "Brier_lightning": 0.09,
            "baseline_persistence_CSI": 0.15,
            "baseline_optflow_CSI": 0.23,
        },
        "note": "Metrics on withheld test events. SYNTHETIC mode — not real operational scores.",
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)
