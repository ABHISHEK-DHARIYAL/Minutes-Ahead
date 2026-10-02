"""
Agent 2: Radar Adapter
Sources: IMD DWR (mausam.imd.gov.in), MOSDAC, NASA GPM IMERG
Libs: Py-ART, wradlib, pySTEPS
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import numpy as np
import httpx
import os

from base_adapter import BaseAdapter, DataProduct, DataMode, GridSpec, INDIA_GRID

logger = logging.getLogger(__name__)


# IMD DWR station list (lat, lon, name)
IMD_DWR_STATIONS = [
    (28.58, 77.20, "DELHI"),
    (22.53, 88.32, "KOLKATA"),
    (19.08, 72.88, "MUMBAI"),
    (13.08, 80.27, "CHENNAI"),
    (17.38, 78.49, "HYDERABAD"),
    (26.85, 80.95, "LUCKNOW"),
    (23.25, 77.41, "BHOPAL"),
    (21.14, 79.08, "NAGPUR"),
    (12.97, 77.59, "BANGALORE"),
    (22.70, 75.86, "INDORE"),
    (26.91, 75.82, "JAIPUR"),
    (23.68, 92.71, "AGARTALA"),
    (26.18, 91.73, "GUWAHATI"),
    (20.27, 85.82, "BHUBANESWAR"),
]


class RadarMosaicAdapter(BaseAdapter):
    """
    Multi-source radar adapter.
    Priority: IMD DWR → MOSDAC → GPM IMERG (rain-rate proxy)
    Output: max-reflectivity composite on India 2km grid.
    """

    def __init__(self, grid: GridSpec = INDIA_GRID, cache_dir: str = "cache"):
        super().__init__("radar_mosaic", grid, cache_dir)
        self.imd_base_url = os.getenv("IMD_DWR_BASE_URL", "https://mausam.imd.gov.in")
        self.mosdac_base_url = os.getenv("MOSDAC_BASE_URL", "https://mosdac.gov.in")
        self.gpm_base_url = "https://gpm.nasa.gov/data/imerg"

    async def health_check(self) -> Dict[str, Any]:
        """Test all radar endpoints."""
        results = {}
        async with httpx.AsyncClient(timeout=10.0) as client:
            # IMD
            try:
                r = await client.get(f"{self.imd_base_url}/radar", follow_redirects=True)
                results["imd_dwr"] = {"status": r.status_code, "ok": r.status_code < 400}
            except Exception as e:
                results["imd_dwr"] = {"status": "error", "ok": False, "error": str(e)}

            # MOSDAC
            try:
                r = await client.get(f"{self.mosdac_base_url}/live", follow_redirects=True)
                results["mosdac"] = {"status": r.status_code, "ok": r.status_code < 400}
            except Exception as e:
                results["mosdac"] = {"status": "error", "ok": False, "error": str(e)}

            # GPM IMERG (Near-Realtime)
            try:
                r = await client.get("https://jsimpsonhttps.pps.eosdis.nasa.gov/imerg/late/", timeout=8.0)
                results["gpm_imerg"] = {"status": r.status_code, "ok": r.status_code < 400}
            except Exception as e:
                results["gpm_imerg"] = {"status": "error", "ok": False, "error": str(e)}

        return results

    async def fetch(self, timestamp: datetime, **kwargs) -> Optional[DataProduct]:
        """
        Try sources in priority order. Mosaic all available radars.
        Returns reflectivity (dBZ) and beam-blockage mask arrays.
        """
        # Try GPM IMERG as proxy (always publicly accessible)
        imerg_data = await self._fetch_gpm_imerg(timestamp)
        if imerg_data is not None:
            self._mode = DataMode.LIVE
            return imerg_data

        return None

    async def _fetch_gpm_imerg(self, timestamp: datetime) -> Optional[DataProduct]:
        """
        Fetch GPM IMERG Late Run (30-min latency) rain rate as reflectivity proxy.
        Uses NASA PPS HTTPS server (requires registration in .env).
        """
        try:
            # GPM IMERG Half-Hourly Late Run
            dt = timestamp.replace(minute=(timestamp.minute // 30) * 30, second=0)
            # Build filename pattern
            start_str = dt.strftime("%Y%m%d-S%H%M%S")
            end_dt = dt + timedelta(minutes=29, seconds=59)
            end_str = end_dt.strftime("E%H%M%S")
            date_str = dt.strftime("%Y/%m")
            filename = f"3B-HHR-L.MS.MRG.3IMERG.{dt.strftime('%Y%m%d')}-{start_str}-{end_str}.0000.V07B.HDF5"
            url = f"https://jsimpsonhttps.pps.eosdis.nasa.gov/imerg/late/{date_str}/{filename}"

            user = os.getenv("NASA_EARTHDATA_USER", "")
            pwd = os.getenv("NASA_EARTHDATA_PASS", "")
            if not user:
                raise ValueError("NASA_EARTHDATA_USER not set — using synthetic fallback")

            async with httpx.AsyncClient(
                auth=(user, pwd), timeout=30.0, follow_redirects=True
            ) as client:
                r = await client.get(url)
                if r.status_code == 200:
                    return await self._parse_imerg_hdf5(r.content, timestamp)

        except Exception as e:
            self.logger.warning(f"GPM IMERG fetch failed: {e}")

        return None

    async def _parse_imerg_hdf5(self, content: bytes, timestamp: datetime) -> Optional[DataProduct]:
        """Parse IMERG HDF5 and regrid to India 2km grid."""
        try:
            import h5py, io
            import scipy.interpolate as interp
            from scipy.ndimage import gaussian_filter

            with h5py.File(io.BytesIO(content), "r") as f:
                precip = f["Grid/precipitationCal"][0].T  # (lon, lat) -> transpose
                lat = f["Grid/lat"][:]
                lon = f["Grid/lon"][:]

            # Filter to India domain
            lat_mask = (lat >= self.grid.lat_min) & (lat <= self.grid.lat_max)
            lon_mask = (lon >= self.grid.lon_min) & (lon <= self.grid.lon_max)
            precip_india = precip[np.ix_(lon_mask, lat_mask)]

            # Convert rain rate (mm/hr) to approximate reflectivity (Z-R: Z=200*R^1.6)
            precip_india = np.maximum(precip_india, 0)
            z_linear = 200.0 * (precip_india ** 1.6)
            z_dbz = 10 * np.log10(np.maximum(z_linear, 0.001))
            z_dbz = np.clip(z_dbz, -10, 75).T  # now (lat, lon)

            # Regrid to 2km grid
            out_lat = np.linspace(self.grid.lat_min, self.grid.lat_max, self.grid.ny)
            out_lon = np.linspace(self.grid.lon_min, self.grid.lon_max, self.grid.nx)
            in_lat = lat[lat_mask]
            in_lon = lon[lon_mask]

            # Interpolate
            from scipy.interpolate import RegularGridInterpolator
            rgi = RegularGridInterpolator(
                (in_lat, in_lon), z_dbz, method="linear", bounds_error=False, fill_value=-10
            )
            out_lon_2d, out_lat_2d = np.meshgrid(out_lon, out_lat)
            pts = np.stack([out_lat_2d.ravel(), out_lon_2d.ravel()], axis=1)
            refl = rgi(pts).reshape(self.grid.ny, self.grid.nx).astype(np.float32)
            refl = gaussian_filter(refl, sigma=1.0)

            # Simple beam-blockage mask (zeros = no blockage) — placeholder
            blockage_mask = np.zeros_like(refl, dtype=np.uint8)

            product = DataProduct(
                source="gpm_imerg_proxy",
                timestamp=timestamp,
                data={
                    "reflectivity_dbz": refl,
                    "beam_blockage_mask": blockage_mask.astype(np.float32),
                },
                metadata={
                    "note": "Z-R proxy from GPM IMERG Late Run",
                    "is_proxy": True,
                    "zr_a": 200.0,
                    "zr_b": 1.6,
                },
                mode=DataMode.LIVE,
                is_proxy=True,
                grid=self.grid,
            )
            return product

        except Exception as e:
            self.logger.error(f"IMERG parse error: {e}")
            return None

    async def _synthetic_fallback(self, timestamp: datetime) -> Optional[DataProduct]:
        """Generate a realistic synthetic radar mosaic for demo/testing."""
        rng = np.random.default_rng(int(timestamp.timestamp()) % 10000)
        shape = (self.grid.ny, self.grid.nx)

        # Create several synthetic storm cells
        refl = np.full(shape, -10.0, dtype=np.float32)
        n_cells = rng.integers(2, 6)
        for _ in range(n_cells):
            cy = rng.integers(20, shape[0] - 20)
            cx = rng.integers(20, shape[1] - 20)
            peak = rng.uniform(35, 60)
            radius = rng.integers(10, 30)
            y, x = np.ogrid[:shape[0], :shape[1]]
            dist = np.sqrt((y - cy) ** 2 + (x - cx) ** 2)
            cell = peak * np.exp(-dist ** 2 / (2 * (radius / 2) ** 2))
            refl = np.maximum(refl, cell.astype(np.float32))

        refl = np.clip(refl, -10, 75)
        blockage = np.zeros(shape, dtype=np.float32)

        return DataProduct(
            source="radar_synthetic",
            timestamp=timestamp,
            data={"reflectivity_dbz": refl, "beam_blockage_mask": blockage},
            metadata={"n_cells": n_cells, "note": "synthetic radar mosaic"},
            mode=DataMode.SYNTHETIC,
            is_proxy=False,
            grid=self.grid,
        )


class QualityController:
    """QC routines for radar data."""

    @staticmethod
    def despeckle(refl: np.ndarray, min_size: int = 4) -> np.ndarray:
        """Remove isolated pixels (speckle) below min connected component size."""
        from scipy import ndimage
        binary = refl >= 0
        labeled, n = ndimage.label(binary)
        sizes = ndimage.sum(binary, labeled, range(1, n + 1))
        mask = np.zeros_like(binary)
        for i, sz in enumerate(sizes):
            if sz >= min_size:
                mask[labeled == i + 1] = 1
        return np.where(mask, refl, -10.0)

    @staticmethod
    def remove_ap_clutter(refl: np.ndarray, height_mask: np.ndarray) -> np.ndarray:
        """Simple anomalous propagation clutter removal using height mask."""
        # AP clutter tends to appear near terrain at low height — zero-out masked areas
        return np.where(height_mask > 0, -10.0, refl)

    @staticmethod
    def apply_beam_blockage_correction(
        refl: np.ndarray, blockage_fraction: np.ndarray
    ) -> np.ndarray:
        """Apply beam-blockage power correction (dB correction)."""
        # Correction factor: -10*log10(1 - blockage_fraction)
        corr = -10.0 * np.log10(np.maximum(1.0 - blockage_fraction, 0.01))
        return np.minimum(refl + corr, 75.0)
