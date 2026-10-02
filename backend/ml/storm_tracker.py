"""
Agent 3: ML Engine — Storm Tracker (TITAN/SCIT style)
Detects and tracks storm cells, computes ETA per district.
"""

import numpy as np
from scipy import ndimage
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger("ml.storm_tracker")


@dataclass
class StormCell:
    cell_id: str
    timestamp: datetime
    centroid_lat: float
    centroid_lon: float
    area_km2: float
    max_reflectivity: float
    mean_reflectivity: float
    velocity_u: float = 0.0   # m/s eastward
    velocity_v: float = 0.0   # m/s northward
    severity: int = 0         # 0-3
    confidence: float = 0.5
    track_history: List[Tuple[float, float]] = field(default_factory=list)
    eta_districts: Dict[str, float] = field(default_factory=dict)

    @property
    def speed_kmh(self) -> float:
        return math.sqrt(self.velocity_u ** 2 + self.velocity_v ** 2) * 3.6

    @property
    def direction_deg(self) -> float:
        import math
        return math.degrees(math.atan2(self.velocity_u, self.velocity_v)) % 360


import math


class StormTracker:
    """
    TITAN/SCIT-style storm cell detection and tracking.
    """

    def __init__(
        self,
        lat_min: float = 6.0, lat_max: float = 38.0,
        lon_min: float = 68.0, lon_max: float = 98.0,
        ny: int = 1778, nx: int = 1778,
        dbz_threshold: float = 30.0,
        min_area_km2: float = 50.0,
        max_age_steps: int = 6,
    ):
        self.lat_min = lat_min
        self.lat_max = lat_max
        self.lon_min = lon_min
        self.lon_max = lon_max
        self.ny = ny
        self.nx = nx
        self.dbz_threshold = dbz_threshold
        self.min_area_km2 = min_area_km2
        self.max_age_steps = max_age_steps
        self.km_per_pixel = 2.0
        self.min_pixels = int(min_area_km2 / (self.km_per_pixel ** 2))

        # Tracking state
        self.active_cells: Dict[str, StormCell] = {}
        self._cell_counter = 0
        self._step_count = 0

    def detect_cells(
        self, reflectivity: np.ndarray, timestamp: datetime
    ) -> List[StormCell]:
        """Detect storm cells in a reflectivity field."""
        binary = reflectivity >= self.dbz_threshold
        labeled, n_features = ndimage.label(binary)

        cells = []
        for label in range(1, n_features + 1):
            mask = labeled == label
            n_pixels = mask.sum()
            if n_pixels < self.min_pixels:
                continue

            # Cell properties
            centroid = ndimage.center_of_mass(mask)
            cy, cx = centroid  # row, col

            # Convert pixel to lat/lon
            lat = self.lat_min + (cy / self.ny) * (self.lat_max - self.lat_min)
            lon = self.lon_min + (cx / self.nx) * (self.lon_max - self.lon_min)
            area_km2 = n_pixels * self.km_per_pixel ** 2

            refl_values = reflectivity[mask]
            max_refl = refl_values.max()
            mean_refl = refl_values.mean()
            severity = self._classify_severity(max_refl)

            self._cell_counter += 1
            cell = StormCell(
                cell_id=f"CELL-{self._cell_counter:04d}",
                timestamp=timestamp,
                centroid_lat=float(lat),
                centroid_lon=float(lon),
                area_km2=float(area_km2),
                max_reflectivity=float(max_refl),
                mean_reflectivity=float(mean_refl),
                severity=severity,
                confidence=0.8,
                track_history=[(float(lat), float(lon))],
            )
            cells.append(cell)

        return cells

    def update(
        self, new_cells: List[StormCell], timestamp: datetime
    ) -> List[StormCell]:
        """Match new detections to existing tracks using nearest-neighbor."""
        self._step_count += 1
        if not self.active_cells:
            for cell in new_cells:
                self.active_cells[cell.cell_id] = cell
            return new_cells

        # Cost matrix: distance between existing and new cells
        existing = list(self.active_cells.values())
        matched_existing = set()
        matched_new = set()
        updated_cells = []

        for new_cell in new_cells:
            best_dist = 50.0  # max matching distance in km
            best_existing = None

            for ex_cell in existing:
                if ex_cell.cell_id in matched_existing:
                    continue
                dist = self._haversine(
                    ex_cell.centroid_lat, ex_cell.centroid_lon,
                    new_cell.centroid_lat, new_cell.centroid_lon,
                )
                if dist < best_dist:
                    best_dist = dist
                    best_existing = ex_cell

            if best_existing:
                # Update existing track
                dt = 600.0  # 10 min in seconds
                matched_existing.add(best_existing.cell_id)
                matched_new.add(new_cell.cell_id)

                # Compute velocity (m/s)
                d_lat = new_cell.centroid_lat - best_existing.centroid_lat
                d_lon = new_cell.centroid_lon - best_existing.centroid_lon
                v_lat = d_lat * 111000.0 / dt  # m/s northward
                v_lon = d_lon * 111000.0 * math.cos(math.radians(new_cell.centroid_lat)) / dt

                # Smooth velocity (EMA)
                alpha = 0.4
                new_cell.velocity_v = alpha * v_lat + (1 - alpha) * best_existing.velocity_v
                new_cell.velocity_u = alpha * v_lon + (1 - alpha) * best_existing.velocity_u
                new_cell.cell_id = best_existing.cell_id
                new_cell.track_history = best_existing.track_history + [(new_cell.centroid_lat, new_cell.centroid_lon)]
                new_cell.track_history = new_cell.track_history[-20:]  # keep last 20 steps
                updated_cells.append(new_cell)
            else:
                updated_cells.append(new_cell)

        # Remove stale tracks
        new_active = {cell.cell_id: cell for cell in updated_cells}
        self.active_cells = new_active

        return updated_cells

    def compute_district_etas(
        self, cells: List[StormCell], district_centroids: Dict[str, Tuple[float, float]]
    ) -> List[StormCell]:
        """Compute ETA (minutes) for each cell to reach each district centroid."""
        for cell in cells:
            for dist_name, (dlat, dlon) in district_centroids.items():
                d_km = self._haversine(cell.centroid_lat, cell.centroid_lon, dlat, dlon)
                speed_ms = math.sqrt(cell.velocity_u ** 2 + cell.velocity_v ** 2) + 1e-6
                speed_km_min = speed_ms * 60.0 / 1000.0

                if d_km < 50.0:
                    # Check if storm is moving toward district
                    bearing_to_dist = self._bearing(
                        cell.centroid_lat, cell.centroid_lon, dlat, dlon
                    )
                    storm_bearing = math.degrees(math.atan2(cell.velocity_u, cell.velocity_v)) % 360
                    angle_diff = abs(bearing_to_dist - storm_bearing)
                    if angle_diff > 180:
                        angle_diff = 360 - angle_diff

                    if angle_diff < 45:  # storm moving toward district
                        eta_min = (d_km / speed_km_min) if speed_km_min > 0.5 else 999.0
                        cell.eta_districts[dist_name] = round(eta_min, 1)

        return cells

    def generate_storm_cards(self, cells: List[StormCell]) -> List[Dict]:
        """Generate Storm Card data for UI consumption."""
        cards = []
        severity_labels = ["NONE", "MODERATE", "SEVERE", "EXTREME"]
        severity_colors = ["#10B981", "#F59E0B", "#EF4444", "#7C3AED"]

        for cell in cells:
            nearest_district = None
            nearest_eta = None
            if cell.eta_districts:
                nearest_district = min(cell.eta_districts, key=cell.eta_districts.get)
                nearest_eta = cell.eta_districts[nearest_district]

            cards.append({
                "id": cell.cell_id,
                "lat": cell.centroid_lat,
                "lon": cell.centroid_lon,
                "severity": severity_labels[cell.severity],
                "severity_color": severity_colors[cell.severity],
                "max_reflectivity": round(cell.max_reflectivity, 1),
                "area_km2": round(cell.area_km2, 0),
                "speed_kmh": round(cell.speed_kmh, 1),
                "direction_deg": round(cell.direction_deg, 0),
                "confidence": round(cell.confidence, 2),
                "nearest_district": nearest_district,
                "eta_minutes": nearest_eta,
                "track_history": cell.track_history[-5:],
                "timestamp": cell.timestamp.isoformat(),
            })

        return cards

    @staticmethod
    def _haversine(lat1, lon1, lat2, lon2) -> float:
        """Haversine distance in km."""
        R = 6371.0
        φ1, φ2 = math.radians(lat1), math.radians(lat2)
        Δφ = math.radians(lat2 - lat1)
        Δλ = math.radians(lon2 - lon1)
        a = math.sin(Δφ / 2) ** 2 + math.cos(φ1) * math.cos(φ2) * math.sin(Δλ / 2) ** 2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    @staticmethod
    def _bearing(lat1, lon1, lat2, lon2) -> float:
        """Bearing from point 1 to point 2 in degrees."""
        φ1, φ2 = math.radians(lat1), math.radians(lat2)
        Δλ = math.radians(lon2 - lon1)
        x = math.sin(Δλ) * math.cos(φ2)
        y = math.cos(φ1) * math.sin(φ2) - math.sin(φ1) * math.cos(φ2) * math.cos(Δλ)
        return math.degrees(math.atan2(x, y)) % 360

    @staticmethod
    def _classify_severity(max_dbz: float) -> int:
        if max_dbz >= 55:
            return 3  # EXTREME
        elif max_dbz >= 45:
            return 2  # SEVERE
        elif max_dbz >= 35:
            return 1  # MODERATE
        return 0  # NONE
