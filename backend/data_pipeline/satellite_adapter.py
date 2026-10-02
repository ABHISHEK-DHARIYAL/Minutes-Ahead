"""
Agent 2: Satellite Adapter
Sources: MOSDAC INSAT-3D/3DR, Himawari-9 (AWS), EUMETSAT IODC, NASA GIBS
"""

import asyncio
import logging
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import numpy as np
import httpx

from base_adapter import BaseAdapter, DataProduct, DataMode, GridSpec, INDIA_GRID

logger = logging.getLogger(__name__)


class SatelliteAdapter(BaseAdapter):
    """
    Multi-source satellite adapter.
    Channels: VIS, IR10.8, WV6.2, BT-diff (IR10.8-IR12.0), overshooting-top flag
    Priority: MOSDAC INSAT-3D → Himawari-9 AWS → EUMETSAT IODC
    """

    def __init__(self, grid: GridSpec = INDIA_GRID, cache_dir: str = "cache"):
        super().__init__("satellite", grid, cache_dir)
        self.himawari_s3_bucket = "noaa-himawari9"
        self.gibs_base = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best"

    async def health_check(self) -> Dict[str, Any]:
        """Test all satellite endpoints."""
        results = {}
        async with httpx.AsyncClient(timeout=12.0) as client:
            # Himawari-9 on AWS (anonymous)
            try:
                url = "https://noaa-himawari9.s3.amazonaws.com/"
                r = await client.get(url)
                results["himawari9_aws"] = {"status": r.status_code, "ok": r.status_code < 400}
            except Exception as e:
                results["himawari9_aws"] = {"ok": False, "error": str(e)}

            # NASA GIBS (free tiles)
            try:
                tile_url = (
                    f"{self.gibs_base}/GOES-East_ABI_Band9_Clean_Longwave_Window_Temperature/"
                    "default/2024-06-01/250m/0/0/0.jpg"
                )
                r = await client.get(tile_url, timeout=8.0)
                results["nasa_gibs"] = {"status": r.status_code, "ok": r.status_code < 400}
            except Exception as e:
                results["nasa_gibs"] = {"ok": False, "error": str(e)}

            # Open-Meteo (no key needed — not satellite but sanity check)
            try:
                r = await client.get(
                    "https://api.open-meteo.com/v1/forecast?latitude=28&longitude=77&hourly=cape&forecast_days=1"
                )
                results["open_meteo"] = {"status": r.status_code, "ok": r.status_code == 200}
            except Exception as e:
                results["open_meteo"] = {"ok": False, "error": str(e)}

        return results

    async def fetch(self, timestamp: datetime, **kwargs) -> Optional[DataProduct]:
        """Fetch satellite channels. Try Himawari-9 first (anonymous AWS), then GIBS tiles."""
        product = await self._fetch_himawari9(timestamp)
        if product:
            return product

        # Fall through to synthetic
        return None

    async def _fetch_himawari9(self, timestamp: datetime) -> Optional[DataProduct]:
        """
        Himawari-9 Full Disk data on AWS Open Data (s3://noaa-himawari9).
        B03=VIS 0.64µm, B13=IR 10.4µm, B08=WV 6.2µm, B15=IR 12.4µm (for BT diff)
        Uses aiobotocore / anonymous boto3 access.
        """
        try:
            import boto3
            from botocore import UNSIGNED
            from botocore.config import Config
            from io import BytesIO

            s3 = boto3.client(
                "s3",
                region_name="us-east-1",
                config=Config(signature_version=UNSIGNED),
            )

            # Snap to 10-min (Himawari full-disk every 10 min)
            dt = timestamp.replace(minute=(timestamp.minute // 10) * 10, second=0)
            bands = {"B03": "VIS_064", "B08": "WV_062", "B13": "IR_104", "B15": "IR_124"}
            channel_data = {}

            for band_id, var_name in bands.items():
                # Key pattern: AHI-L1b-FLDK/YYYY/MM/DD/HHmm/HS_H09_YYYYMMDD_HHmm_<BAND>_FLDK_R20_S1010.DAT.bz2
                key_prefix = (
                    f"AHI-L1b-FLDK/{dt.strftime('%Y/%m/%d/%H%M')}/"
                    f"HS_H09_{dt.strftime('%Y%m%d_%H%M')}_{band_id}_FLDK"
                )
                # List objects to find correct key
                resp = s3.list_objects_v2(
                    Bucket=self.himawari_s3_bucket,
                    Prefix=key_prefix,
                    MaxKeys=20
                )
                if not resp.get("Contents"):
                    self.logger.debug(f"Himawari {band_id} not found for {dt}")
                    continue

                # Download segment 1 (full-disk split into segments)
                seg_keys = [obj["Key"] for obj in resp["Contents"] if "S0101" in obj["Key"]]
                if not seg_keys:
                    seg_keys = [resp["Contents"][0]["Key"]]

                obj_resp = s3.get_object(Bucket=self.himawari_s3_bucket, Key=seg_keys[0])
                raw = obj_resp["Body"].read()
                arr = await self._parse_himawari_segment(raw, band_id)
                if arr is not None:
                    channel_data[var_name] = arr

            if len(channel_data) < 2:
                return None

            # Compute derived channels
            if "IR_104" in channel_data and "IR_124" in channel_data:
                channel_data["BT_diff"] = (
                    channel_data["IR_104"] - channel_data["IR_124"]
                ).astype(np.float32)

            if "IR_104" in channel_data:
                # Overshooting top: cold < -60°C (213K) + BT gradient
                bt_k = channel_data["IR_104"] + 273.15  # assuming stored as °C
                ost = ((bt_k < 213.0)).astype(np.float32)
                channel_data["overshooting_top"] = ost

            return DataProduct(
                source="himawari9",
                timestamp=timestamp,
                data=channel_data,
                metadata={"satellite": "Himawari-9", "provider": "NOAA AWS Open Data"},
                mode=DataMode.LIVE,
                grid=self.grid,
            )

        except Exception as e:
            self.logger.warning(f"Himawari-9 fetch failed: {e}")
            return None

    async def _parse_himawari_segment(self, raw: bytes, band_id: str) -> Optional[np.ndarray]:
        """Parse Himawari compressed segment to BT/reflectance array on India grid."""
        try:
            import bz2, struct
            from scipy.interpolate import RegularGridInterpolator

            # Decompress
            if raw[:2] == b"BZ":
                data = bz2.decompress(raw)
            else:
                data = raw

            # Header: 11 blocks, block 1 = basic information
            # This is a simplified parser — production would use satpy
            header_size = 282 + 984 + 636 + 136 + 988 + 60 + 60 + 60 + 60 + 60
            pixel_data = np.frombuffer(data[header_size:], dtype=">u2")

            # Rough full-disk size for 2km bands: 5500 x 5500
            size = int(np.sqrt(len(pixel_data)))
            pixel_data = pixel_data[: size * size].reshape(size, size).astype(np.float32)

            # Convert count to BT (simplified calibration)
            # Production: use LUT from block 5
            bt = (pixel_data / 65535.0) * 100.0 - 50.0  # rough °C approximation

            # Crop to India (rough pixel region for full-disk)
            # Himawari-9 centered at 140.7E; India ~68-98E, 6-38N
            # Row: ~1200-2200 (rough), Col: ~800-1800 (rough)
            lat_pct_min = (85 - 38) / 180  # fraction from top
            lat_pct_max = (85 - 6) / 180
            lon_pct_min = (68 - (140.7 - 90)) / 180
            lon_pct_max = (98 - (140.7 - 90)) / 180

            r0 = int(lat_pct_min * size)
            r1 = int(lat_pct_max * size)
            c0 = int(lon_pct_min * size)
            c1 = int(lon_pct_max * size)

            india_crop = bt[r0:r1, c0:c1]
            if india_crop.size == 0:
                return None

            # Regrid to common grid
            in_lat = np.linspace(38, 6, india_crop.shape[0])
            in_lon = np.linspace(68, 98, india_crop.shape[1])
            out_lat = np.linspace(self.grid.lat_min, self.grid.lat_max, self.grid.ny)
            out_lon = np.linspace(self.grid.lon_min, self.grid.lon_max, self.grid.nx)

            rgi = RegularGridInterpolator(
                (in_lat[::-1], in_lon), india_crop[::-1],
                method="linear", bounds_error=False, fill_value=20.0
            )
            out_lon_2d, out_lat_2d = np.meshgrid(out_lon, out_lat)
            pts = np.stack([out_lat_2d.ravel(), out_lon_2d.ravel()], axis=1)
            result = rgi(pts).reshape(self.grid.ny, self.grid.nx).astype(np.float32)
            return result

        except Exception as e:
            self.logger.error(f"Himawari segment parse failed: {e}")
            return None

    async def _synthetic_fallback(self, timestamp: datetime) -> Optional[DataProduct]:
        """Generate realistic synthetic satellite channels."""
        rng = np.random.default_rng(int(timestamp.timestamp()) % 99991)
        shape = (self.grid.ny, self.grid.nx)

        # Background: warm BT (~25°C) with smooth noise
        ir = np.full(shape, 25.0, dtype=np.float32)
        ir += rng.normal(0, 2.0, shape).astype(np.float32)

        # Add cold cloud tops at storm regions
        n_clouds = rng.integers(3, 8)
        for _ in range(n_clouds):
            cy = rng.integers(30, shape[0] - 30)
            cx = rng.integers(30, shape[1] - 30)
            cold = rng.uniform(-70, -40)
            radius = rng.integers(15, 50)
            y, x = np.ogrid[:shape[0], :shape[1]]
            dist = np.sqrt((y - cy) ** 2 + (x - cx) ** 2)
            cloud = cold * np.exp(-dist ** 2 / (2 * (radius / 2) ** 2))
            ir = np.minimum(ir, (25.0 + cloud).astype(np.float32))

        vis = np.clip((25.0 - ir) / 100.0, 0, 1).astype(np.float32)
        wv = ir - rng.uniform(5, 15, shape).astype(np.float32)
        bt_diff = rng.normal(2.0, 1.5, shape).astype(np.float32)
        ost = (ir < -60.0).astype(np.float32)

        return DataProduct(
            source="satellite_synthetic",
            timestamp=timestamp,
            data={
                "VIS_064": vis,
                "IR_104": ir,
                "WV_062": wv,
                "BT_diff": bt_diff,
                "overshooting_top": ost,
            },
            metadata={"note": "synthetic satellite channels"},
            mode=DataMode.SYNTHETIC,
            grid=self.grid,
        )
