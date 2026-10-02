"""
Agent 2: Lightning Adapter
Sources: Blitzortung (non-commercial), NASA LIS/OTD via GHRC, proxy labels
"""

import asyncio
import logging
import os
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import numpy as np
import httpx

from base_adapter import BaseAdapter, DataProduct, DataMode, GridSpec, INDIA_GRID

logger = logging.getLogger(__name__)


class LightningAdapter(BaseAdapter):
    """
    Lightning strike adapter.
    Sources: Blitzortung (real-time, community, non-commercial terms)
             NASA LIS/OTD via GHRC DAAC (historical climatology)
             Proxy labels (cold BT < -40°C + reflectivity >= 40 dBZ above -10°C level)
    Output: gridded_lightning_counts on India 2km grid.
    NOTE: GOES-GLM is NOT used (does not cover India).
    """

    def __init__(self, grid: GridSpec = INDIA_GRID, cache_dir: str = "cache"):
        super().__init__("lightning", grid, cache_dir)
        # Blitzortung live archive (non-commercial terms confirmed)
        self.blitzortung_base = "https://data.blitzortung.org/Data_1/Protected"
        self.blitzortung_user = os.getenv("BLITZORTUNG_USER", "")
        self.blitzortung_pass = os.getenv("BLITZORTUNG_PASS", "")

    async def health_check(self) -> Dict[str, Any]:
        """Test lightning data endpoints."""
        results = {}
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Blitzortung
            try:
                r = await client.get(
                    "https://data.blitzortung.org/",
                    auth=(self.blitzortung_user, self.blitzortung_pass) if self.blitzortung_user else None,
                    timeout=5.0,
                )
                results["blitzortung"] = {"status": r.status_code, "ok": r.status_code < 400}
            except Exception as e:
                results["blitzortung"] = {"ok": False, "error": str(e)}

            # GHRC DAAC (NASA LIS/OTD)
            try:
                r = await client.get("https://ghrc.nsstc.nasa.gov/lightning/data/lis/")
                results["ghrc_daac"] = {"status": r.status_code, "ok": r.status_code < 400}
            except Exception as e:
                results["ghrc_daac"] = {"ok": False, "error": str(e)}

        return results

    async def fetch(self, timestamp: datetime, **kwargs) -> Optional[DataProduct]:
        """Fetch lightning strikes from Blitzortung."""
        product = await self._fetch_blitzortung(timestamp)
        if product:
            return product
        return None

    async def _fetch_blitzortung(self, timestamp: datetime) -> Optional[DataProduct]:
        """
        Fetch from Blitzortung protected archive.
        Non-commercial use terms apply. Keys in .env.
        """
        if not self.blitzortung_user:
            self.logger.warning("BLITZORTUNG_USER not set; skipping live lightning fetch")
            return None

        try:
            # Blitzortung stores data in 10-min JSON files
            dt = timestamp.replace(minute=(timestamp.minute // 10) * 10, second=0)
            url = (
                f"{self.blitzortung_base}/"
                f"{dt.strftime('%Y/%m/%d/%H')}/{dt.strftime('%M')}.json"
            )

            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.get(
                    url, auth=(self.blitzortung_user, self.blitzortung_pass)
                )
                if r.status_code == 200:
                    strikes = r.json()  # list of {lat, lon, time, ...}
                    grid = self._strikes_to_grid(strikes, timestamp)
                    return DataProduct(
                        source="blitzortung",
                        timestamp=timestamp,
                        data={"lightning_counts": grid, "lightning_energy": grid.astype(np.float32)},
                        metadata={
                            "n_strikes_raw": len(strikes),
                            "terms": "non-commercial Blitzortung community data",
                        },
                        mode=DataMode.LIVE,
                        grid=self.grid,
                    )
        except Exception as e:
            self.logger.warning(f"Blitzortung fetch failed: {e}")
        return None

    def _strikes_to_grid(
        self, strikes: list, timestamp: datetime, window_minutes: int = 10
    ) -> np.ndarray:
        """Bin strike lat/lon to India 2km grid counts."""
        shape = (self.grid.ny, self.grid.nx)
        grid = np.zeros(shape, dtype=np.float32)
        t0 = timestamp.timestamp()

        for s in strikes:
            try:
                lat = float(s.get("lat", s.get("y", 0)))
                lon = float(s.get("lon", s.get("x", 0)))
                t = float(s.get("time", t0))

                # Filter by domain and time window
                if not (self.grid.lat_min <= lat <= self.grid.lat_max):
                    continue
                if not (self.grid.lon_min <= lon <= self.grid.lon_max):
                    continue
                if abs(t - t0) > window_minutes * 60:
                    continue

                # Grid indices
                row = int((lat - self.grid.lat_min) / (self.grid.lat_max - self.grid.lat_min) * (shape[0] - 1))
                col = int((lon - self.grid.lon_min) / (self.grid.lon_max - self.grid.lon_min) * (shape[1] - 1))
                row = max(0, min(row, shape[0] - 1))
                col = max(0, min(col, shape[1] - 1))
                grid[row, col] += 1
            except (KeyError, ValueError, TypeError):
                continue

        return grid

    def build_proxy_labels(
        self,
        ir_bt: np.ndarray,
        reflectivity: np.ndarray,
        threshold_bt: float = -40.0,
        threshold_dbz: float = 40.0,
    ) -> np.ndarray:
        """
        Proxy lightning labels when real data is missing.
        Condition: cloud-top BT < -40°C AND reflectivity >= 40 dBZ.
        Labeled as IS_PROXY in metadata.
        """
        proxy = ((ir_bt < threshold_bt) & (reflectivity >= threshold_dbz)).astype(np.float32)
        return proxy

    async def _synthetic_fallback(self, timestamp: datetime) -> Optional[DataProduct]:
        """Generate synthetic lightning clusters near synthetic storm cells."""
        rng = np.random.default_rng(int(timestamp.timestamp()) % 31337)
        shape = (self.grid.ny, self.grid.nx)

        grid = np.zeros(shape, dtype=np.float32)
        n_clusters = rng.integers(2, 5)
        for _ in range(n_clusters):
            cy = rng.integers(20, shape[0] - 20)
            cx = rng.integers(20, shape[1] - 20)
            n_strikes = rng.integers(5, 30)
            for _ in range(n_strikes):
                sr = int(rng.normal(cy, 10))
                sc = int(rng.normal(cx, 10))
                sr = max(0, min(sr, shape[0] - 1))
                sc = max(0, min(sc, shape[1] - 1))
                grid[sr, sc] += 1

        return DataProduct(
            source="lightning_synthetic",
            timestamp=timestamp,
            data={"lightning_counts": grid, "lightning_energy": grid * rng.uniform(0.5, 2.0, shape).astype(np.float32)},
            metadata={"note": "synthetic lightning; is_proxy=True"},
            mode=DataMode.SYNTHETIC,
            is_proxy=True,
            grid=self.grid,
        )


class NWPAdapter(BaseAdapter):
    """
    NWP Environment Fields Adapter.
    Primary: Open-Meteo API (CAPE, LI, CIN — no key required)
    Secondary: ERA5 via Copernicus CDS, GFS on NOAA/AWS
    Features: CAPE, CIN, LI, K-index, TCWV, 0-6km shear, 850hPa moisture, freezing level
    """

    def __init__(self, grid: GridSpec = INDIA_GRID, cache_dir: str = "cache"):
        super().__init__("nwp", grid, cache_dir)
        self.open_meteo_url = "https://api.open-meteo.com/v1/forecast"

    async def health_check(self) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                r = await client.get(
                    self.open_meteo_url,
                    params={"latitude": 28.0, "longitude": 77.0, "hourly": "cape", "forecast_days": 1},
                )
                return {"open_meteo": {"status": r.status_code, "ok": r.status_code == 200}}
            except Exception as e:
                return {"open_meteo": {"ok": False, "error": str(e)}}

    async def fetch(self, timestamp: datetime, **kwargs) -> Optional[DataProduct]:
        """Fetch NWP fields from Open-Meteo (no key needed)."""
        try:
            # Fetch on a coarse grid over India then interpolate
            lat_pts = np.arange(self.grid.lat_min, self.grid.lat_max + 2, 2.0)
            lon_pts = np.arange(self.grid.lon_min, self.grid.lon_max + 2, 2.0)

            variables = ["cape", "cin", "lifted_index", "total_column_water_vapour"]
            fields: Dict[str, np.ndarray] = {}

            async with httpx.AsyncClient(timeout=30.0) as client:
                # Sample a coarse subset to avoid rate limits
                lat_sub = lat_pts[::4]
                lon_sub = lon_pts[::4]
                tasks = []
                for lat in lat_sub:
                    for lon in lon_sub:
                        params = {
                            "latitude": float(lat),
                            "longitude": float(lon),
                            "hourly": ",".join(variables),
                            "forecast_days": 2,
                            "timezone": "Asia/Kolkata",
                        }
                        tasks.append(client.get(self.open_meteo_url, params=params))

                responses = await asyncio.gather(*tasks, return_exceptions=True)

                coarse_data = {v: [] for v in variables}
                lats_used = []
                lons_used = []

                for (lat, lon), resp in zip(
                    [(la, lo) for la in lat_sub for lo in lon_sub], responses
                ):
                    if isinstance(resp, Exception):
                        continue
                    if resp.status_code != 200:
                        continue
                    try:
                        js = resp.json()
                        hourly = js.get("hourly", {})
                        times = hourly.get("time", [])
                        # Find closest hour
                        target = timestamp.strftime("%Y-%m-%dT%H:00")
                        if target in times:
                            idx = times.index(target)
                            lats_used.append(float(lat))
                            lons_used.append(float(lon))
                            for v in variables:
                                val = hourly.get(v, [None] * (idx + 1))[idx]
                                coarse_data[v].append(float(val) if val is not None else 0.0)
                    except Exception:
                        continue

            if not lats_used:
                return None

            # Interpolate coarse points to 2km grid
            from scipy.interpolate import griddata
            out_lat = np.linspace(self.grid.lat_min, self.grid.lat_max, self.grid.ny)
            out_lon = np.linspace(self.grid.lon_min, self.grid.lon_max, self.grid.nx)
            out_lon_2d, out_lat_2d = np.meshgrid(out_lon, out_lat)
            pts = np.column_stack([lats_used, lons_used])

            for v in variables:
                vals = np.array(coarse_data[v])
                if len(vals) < 3:
                    fields[v] = np.zeros((self.grid.ny, self.grid.nx), dtype=np.float32)
                    continue
                interp = griddata(pts, vals, (out_lat_2d, out_lon_2d), method="linear", fill_value=0.0)
                fields[v] = interp.astype(np.float32)

            # Compute K-index proxy: CAPE / 100 + moisture factor (simplified)
            cape = fields.get("cape", np.zeros((self.grid.ny, self.grid.nx), dtype=np.float32))
            tcwv = fields.get("total_column_water_vapour", np.ones_like(cape) * 40)
            fields["k_index"] = (cape / 100.0 + tcwv / 10.0).astype(np.float32)
            fields["wind_shear_0_6km"] = np.zeros_like(cape)  # placeholder — needs pressure levels
            fields["freezing_level_m"] = np.full_like(cape, 4500.0)  # placeholder

            return DataProduct(
                source="open_meteo",
                timestamp=timestamp,
                data=fields,
                metadata={"source": "Open-Meteo API", "no_key_required": True},
                mode=DataMode.LIVE,
                grid=self.grid,
            )

        except Exception as e:
            self.logger.warning(f"NWP fetch failed: {e}")
            return None

    async def _synthetic_fallback(self, timestamp: datetime) -> Optional[DataProduct]:
        """Generate synthetic NWP fields typical of Indian monsoon."""
        rng = np.random.default_rng(int(timestamp.timestamp()) % 12345)
        shape = (self.grid.ny, self.grid.nx)

        # Monsoon-realistic ranges
        cape = rng.uniform(500, 3000, shape).astype(np.float32)
        cin = rng.uniform(-200, -10, shape).astype(np.float32)
        li = rng.uniform(-6, 2, shape).astype(np.float32)
        tcwv = rng.uniform(30, 70, shape).astype(np.float32)
        k_index = (cape / 100.0 + tcwv / 10.0).astype(np.float32)
        shear = rng.uniform(5, 30, shape).astype(np.float32)
        freezing = rng.uniform(3500, 5500, shape).astype(np.float32)
        moisture_850 = rng.uniform(50, 95, shape).astype(np.float32)

        return DataProduct(
            source="nwp_synthetic",
            timestamp=timestamp,
            data={
                "cape": cape, "cin": cin, "lifted_index": li,
                "total_column_water_vapour": tcwv, "k_index": k_index,
                "wind_shear_0_6km": shear, "freezing_level_m": freezing,
                "moisture_850hpa": moisture_850,
            },
            metadata={"note": "synthetic NWP; monsoon-realistic ranges"},
            mode=DataMode.SYNTHETIC,
            grid=self.grid,
        )
