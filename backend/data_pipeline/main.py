"""
Agent 2: Data Pipeline Orchestrator
Coordinates all adapters, manages health checks, assembles tensors for ML engine.
"""

import asyncio
import logging
import os
import json
from datetime import datetime, timedelta
from typing import Dict, Optional, List, Any
import numpy as np
from pathlib import Path

from base_adapter import DataMode, GridSpec, INDIA_GRID, DataProduct
from radar_adapter import RadarMosaicAdapter
from satellite_adapter import SatelliteAdapter
from lightning_nwp_adapter import LightningAdapter, NWPAdapter

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("pipeline.orchestrator")


class DataPipelineOrchestrator:
    """
    Coordinates all data adapters, assembles multi-channel tensors,
    and exposes a single get_tensor() call for the ML engine.
    """

    CHANNEL_ORDER = [
        # Radar (2 channels)
        "reflectivity_dbz",
        "beam_blockage_mask",
        # Satellite (5 channels)
        "VIS_064",
        "IR_104",
        "WV_062",
        "BT_diff",
        "overshooting_top",
        # Lightning (2 channels)
        "lightning_counts",
        "lightning_energy",
        # NWP (8 channels)
        "cape",
        "cin",
        "lifted_index",
        "total_column_water_vapour",
        "k_index",
        "wind_shear_0_6km",
        "freezing_level_m",
        "moisture_850hpa",
    ]
    N_CHANNELS = len(CHANNEL_ORDER)  # 17 total

    def __init__(self, grid: GridSpec = INDIA_GRID, cache_dir: str = "cache"):
        self.grid = grid
        self.cache_dir = cache_dir
        Path(cache_dir).mkdir(parents=True, exist_ok=True)

        self.adapters = {
            "radar": RadarMosaicAdapter(grid, cache_dir),
            "satellite": SatelliteAdapter(grid, cache_dir),
            "lightning": LightningAdapter(grid, cache_dir),
            "nwp": NWPAdapter(grid, cache_dir),
        }

        self._current_modes: Dict[str, DataMode] = {k: DataMode.SYNTHETIC for k in self.adapters}
        self._last_health: Dict[str, Any] = {}

    async def run_health_checks(self) -> Dict[str, Any]:
        """Run health checks on all adapters and log results."""
        logger.info("Running data source health checks...")
        results = {}
        for name, adapter in self.adapters.items():
            try:
                r = await adapter.health_check()
                results[name] = r
                logger.info(f"  [{name}] {r}")
            except Exception as e:
                results[name] = {"error": str(e)}
                logger.warning(f"  [{name}] health check failed: {e}")
        self._last_health = results
        return results

    async def get_tensor(
        self, timestamp: datetime, n_timesteps: int = 6
    ) -> Dict[str, Any]:
        """
        Assemble multi-source tensor for the ML engine.
        Returns:
            {
                "tensor": np.ndarray (n_timesteps, C, H, W),
                "missing_mask": np.ndarray (n_timesteps, n_sources),
                "modes": list of DataMode strings,
                "dominant_mode": DataMode,
                "metadata": dict
            }
        """
        # Fetch tensors for the last n_timesteps at 10-min intervals
        timestamps = [timestamp - timedelta(minutes=10 * i) for i in range(n_timesteps - 1, -1, -1)]
        results = await asyncio.gather(
            *[self._fetch_all_sources(t) for t in timestamps], return_exceptions=True
        )

        tensor_list = []
        missing_mask_list = []
        mode_list = []

        for r in results:
            if isinstance(r, Exception):
                logger.error(f"Fetch failed: {r}")
                tensor_list.append(np.zeros((self.N_CHANNELS, self.grid.ny, self.grid.nx), dtype=np.float32))
                missing_mask_list.append(np.ones(4, dtype=bool))  # all missing
                mode_list.append(DataMode.SYNTHETIC)
            else:
                tensor_list.append(r["channels"])
                missing_mask_list.append(r["missing"])
                mode_list.append(r["mode"])

        tensor = np.stack(tensor_list, axis=0)  # (T, C, H, W)
        missing_mask = np.stack(missing_mask_list, axis=0)  # (T, n_sources)

        # Dominant mode: LIVE > REPLAY > SYNTHETIC
        dominant_mode = DataMode.SYNTHETIC
        if any(m == DataMode.LIVE for m in mode_list):
            dominant_mode = DataMode.LIVE
        elif any(m == DataMode.REPLAY for m in mode_list):
            dominant_mode = DataMode.REPLAY

        return {
            "tensor": tensor,
            "missing_mask": missing_mask,
            "modes": [m.value for m in mode_list],
            "dominant_mode": dominant_mode.value,
            "timestamp": timestamp.isoformat(),
            "channel_names": self.CHANNEL_ORDER,
            "grid": {
                "lat_min": self.grid.lat_min, "lat_max": self.grid.lat_max,
                "lon_min": self.grid.lon_min, "lon_max": self.grid.lon_max,
                "ny": self.grid.ny, "nx": self.grid.nx,
            },
            "metadata": {"health": self._last_health},
        }

    async def _fetch_all_sources(self, timestamp: datetime) -> Dict[str, Any]:
        """Fetch all sources for one timestamp and assemble a channel array."""
        tasks = {
            name: adapter.fetch_with_fallback(timestamp)
            for name, adapter in self.adapters.items()
        }
        products = {}
        for name, coro in tasks.items():
            try:
                products[name] = await coro
            except Exception as e:
                logger.warning(f"Adapter {name} error: {e}")
                products[name] = None

        shape = (self.grid.ny, self.grid.nx)
        channels = np.zeros((self.N_CHANNELS, *shape), dtype=np.float32)
        missing = np.zeros(len(self.adapters), dtype=bool)

        for i, ch_name in enumerate(self.CHANNEL_ORDER):
            placed = False
            for name, product in products.items():
                if product and ch_name in product.data:
                    arr = product.data[ch_name]
                    if arr.shape == shape:
                        channels[i] = arr
                    else:
                        # Resize if shape mismatch (shouldn't happen after proper regridding)
                        from scipy.ndimage import zoom
                        zoom_y = shape[0] / arr.shape[0]
                        zoom_x = shape[1] / arr.shape[1]
                        channels[i] = zoom(arr, (zoom_y, zoom_x)).astype(np.float32)
                    placed = True
                    break
            if not placed:
                channels[i] = np.full(shape, np.nan)

        # Track which sources are missing
        for j, name in enumerate(["radar", "satellite", "lightning", "nwp"]):
            if products.get(name) is None:
                missing[j] = True

        # Collect dominant mode
        modes_present = [p.mode for p in products.values() if p is not None]
        if DataMode.LIVE in modes_present:
            mode = DataMode.LIVE
        elif DataMode.REPLAY in modes_present:
            mode = DataMode.REPLAY
        else:
            mode = DataMode.SYNTHETIC

        return {"channels": channels, "missing": missing, "mode": mode}

    def get_data_mode_badge(self) -> str:
        """Return the DATA MODE badge string for the UI."""
        modes = list(self._current_modes.values())
        if DataMode.LIVE in modes:
            return "🟢 LIVE"
        elif DataMode.REPLAY in modes:
            return "🟡 REPLAY"
        return "🟠 SYNTHETIC"


async def main():
    """Test the data pipeline."""
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["live", "synthetic"], default="synthetic")
    args = parser.parse_args()

    orchestrator = DataPipelineOrchestrator()

    logger.info("=== VajraNet Data Pipeline ===")
    health = await orchestrator.run_health_checks()

    logger.info("\nHealth check results:")
    print(json.dumps(health, indent=2, default=str))

    logger.info("\nFetching tensor for current timestamp...")
    result = await orchestrator.get_tensor(datetime.utcnow(), n_timesteps=3)

    tensor = result["tensor"]
    logger.info(f"Tensor shape: {tensor.shape}")
    logger.info(f"Dominant mode: {result['dominant_mode']}")
    logger.info(f"Data mode badge: {orchestrator.get_data_mode_badge()}")
    logger.info(f"Channels: {result['channel_names']}")
    logger.info(f"NaN ratio: {np.isnan(tensor).mean():.2%}")

    # Save sample
    np.save("sample_tensor.npy", tensor)
    logger.info("Saved sample_tensor.npy")


if __name__ == "__main__":
    asyncio.run(main())
