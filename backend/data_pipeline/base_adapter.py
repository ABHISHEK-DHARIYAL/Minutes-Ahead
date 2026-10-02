"""
Agent 2: Data Pipeline — Base Adapter Interface
All data source adapters implement this ABC.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, Dict, Any
import numpy as np
import logging
from enum import Enum
from datetime import datetime

logger = logging.getLogger(__name__)


class DataMode(str, Enum):
    LIVE = "LIVE"
    REPLAY = "REPLAY"
    SYNTHETIC = "SYNTHETIC"


@dataclass
class GridSpec:
    """Common 2 km grid specification for India domain."""
    lat_min: float = 6.0
    lat_max: float = 38.0
    lon_min: float = 68.0
    lon_max: float = 98.0
    resolution_km: float = 2.0
    # Derived
    nx: int = 0
    ny: int = 0

    def __post_init__(self):
        import math
        deg_per_km = 1 / 111.0
        self.nx = math.ceil((self.lon_max - self.lon_min) / (self.resolution_km * deg_per_km))
        self.ny = math.ceil((self.lat_max - self.lat_min) / (self.resolution_km * deg_per_km))


INDIA_GRID = GridSpec()


@dataclass
class DataProduct:
    """Standardized output from any data adapter."""
    source: str
    timestamp: datetime
    data: Dict[str, np.ndarray]       # variable_name -> (ny, nx) array
    metadata: Dict[str, Any]
    mode: DataMode
    qc_flags: Optional[np.ndarray] = None  # (ny, nx) uint8 bitmask
    is_proxy: bool = False
    grid: GridSpec = None

    def __post_init__(self):
        if self.grid is None:
            self.grid = INDIA_GRID


class BaseAdapter(ABC):
    """Abstract base class for all data source adapters."""

    def __init__(self, name: str, grid: GridSpec = INDIA_GRID, cache_dir: str = "cache"):
        self.name = name
        self.grid = grid
        self.cache_dir = cache_dir
        self._mode = DataMode.SYNTHETIC
        self.logger = logging.getLogger(f"adapter.{name}")

    @abstractmethod
    async def fetch(self, timestamp: datetime, **kwargs) -> Optional[DataProduct]:
        """Fetch and return a regridded DataProduct for the given timestamp."""
        ...

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Test if the data endpoint is reachable. Return status dict."""
        ...

    async def fetch_with_fallback(self, timestamp: datetime, **kwargs) -> Optional[DataProduct]:
        """Try live fetch; fall back to cache/synthetic with mode badge update."""
        try:
            product = await self.fetch(timestamp, **kwargs)
            if product:
                self._mode = DataMode.LIVE
                return product
        except Exception as e:
            self.logger.warning(f"{self.name}: live fetch failed ({e}), trying cache")

        cached = await self._load_cache(timestamp)
        if cached:
            cached.mode = DataMode.REPLAY
            self._mode = DataMode.REPLAY
            return cached

        self.logger.warning(f"{self.name}: no cache, generating synthetic fallback")
        synthetic = await self._synthetic_fallback(timestamp)
        if synthetic:
            synthetic.mode = DataMode.SYNTHETIC
            self._mode = DataMode.SYNTHETIC
        return synthetic

    async def _load_cache(self, timestamp: datetime) -> Optional[DataProduct]:
        """Load from local NetCDF cache."""
        import os, xarray as xr
        path = os.path.join(self.cache_dir, self.name, f"{timestamp.strftime('%Y%m%d_%H%M')}.nc")
        if os.path.exists(path):
            try:
                ds = xr.open_dataset(path)
                data = {v: ds[v].values for v in ds.data_vars}
                return DataProduct(
                    source=self.name, timestamp=timestamp, data=data,
                    metadata=dict(ds.attrs), mode=DataMode.REPLAY
                )
            except Exception as e:
                self.logger.error(f"Cache load failed: {e}")
        return None

    async def _save_cache(self, product: DataProduct):
        """Save a DataProduct to local NetCDF cache."""
        import os, xarray as xr
        os.makedirs(os.path.join(self.cache_dir, self.name), exist_ok=True)
        path = os.path.join(self.cache_dir, self.name, f"{product.timestamp.strftime('%Y%m%d_%H%M')}.nc")
        data_vars = {k: (["lat", "lon"], v) for k, v in product.data.items()}
        ds = xr.Dataset(data_vars, attrs=product.metadata)
        ds.to_netcdf(path)

    async def _synthetic_fallback(self, timestamp: datetime) -> Optional[DataProduct]:
        """Generate synthetic data for testing. Override in subclass for realism."""
        shape = (self.grid.ny, self.grid.nx)
        return DataProduct(
            source=self.name,
            timestamp=timestamp,
            data={"synthetic": np.zeros(shape, dtype=np.float32)},
            metadata={"note": "synthetic fallback"},
            mode=DataMode.SYNTHETIC,
            is_proxy=True,
        )

    @property
    def current_mode(self) -> DataMode:
        return self._mode
