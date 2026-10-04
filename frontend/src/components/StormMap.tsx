"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { NowcastData, StormCard } from "@/app/page";
import { LiveWeatherData, IMD_DWR_NETWORK } from "@/data/indiaData";
import { AI_RISK_ZONES, RiskZone } from "@/data/riskZonesData";

interface StormMapProps {
  nowcast: NowcastData | null;
  lightning: { lat: number; lon: number; t: number }[];
  activeLayers: Record<string, boolean>;
  selectedLead: number;
  scrubOffset: number;
  selectedStorm: StormCard | null;
  onStormSelect: (s: StormCard | null) => void;
  weatherData: LiveWeatherData[];
  selectedStation: LiveWeatherData | null;
  onSelectStation: (st: LiveWeatherData | null) => void;
  flyToCoord: { lat: number; lon: number } | null;
  isActive?: boolean;
}

// ── Free basemaps: no API key, no billing, no account ───────────────
// Streets: OpenStreetMap standard tiles.
// Satellite: Esri World Imagery (+ Esri place-name labels on top).
const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const ESRI_IMAGERY_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ESRI_LABELS_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const ESRI_ATTR = "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics";

// Exact geographic center and Standard Meridian of India (82.5° E)
const INDIA_CENTER: [number, number] = [22.8, 82.5];
const INDIA_BOUNDS: L.LatLngBoundsExpression = [
  [6.8, 68.0],
  [36.0, 97.5],
];

function resetToIndiaView(map: L.Map, animated = false) {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const targetCenter: [number, number] = isMobile ? [22.2, 82.0] : [22.8, 82.5];
  const targetZoom = isMobile ? 4.2 : 4.85;

  if (animated) {
    map.flyTo(targetCenter, targetZoom, { duration: 0.8 });
  } else {
    map.setView(targetCenter, targetZoom);
  }
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function findNearestRadar(lat: number, lon: number) {
  let nearest = IMD_DWR_NETWORK[0];
  let minDistance = Infinity;
  for (const radar of IMD_DWR_NETWORK) {
    const dist = getDistanceKm(lat, lon, radar.lat, radar.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = radar;
    }
  }
  return { radar: nearest, distanceKm: minDistance };
}

function getCompassDirection(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round((deg % 360) / 22.5);
  return directions[index % 16];
}

export default function StormMap({
  nowcast,
  lightning,
  activeLayers,
  selectedLead,
  scrubOffset,
  selectedStorm,
  onStormSelect,
  weatherData,
  selectedStation,
  onSelectStation,
  flyToCoord,
  isActive = true,
}: StormMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayersRef = useRef<L.Layer[]>([]);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Basemap mode: 'streets' (OpenStreetMap) or 'satellite' (Esri imagery)
  const [mapMode, setMapMode] = useState<"streets" | "satellite">("satellite");

  // One layer group per overlay type so each can be cleared independently
  const stationLayerRef = useRef<L.LayerGroup | null>(null);
  const dwrLayerRef = useRef<L.LayerGroup | null>(null);
  const stormLayerRef = useRef<L.LayerGroup | null>(null);
  const lightningLayerRef = useRef<L.LayerGroup | null>(null);
  const riskZonesLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedRiskZone, setSelectedRiskZone] = useState<RiskZone | null>(null);

  const htmlIcon = (html: string, size: [number, number], anchor: [number, number]) =>
    L.divIcon({ html, className: "", iconSize: size, iconAnchor: anchor });

  // ── 1. Initialize Leaflet map ─────────────────────────────────────
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    const initialZoom = isMobile ? 4.2 : 4.85;
    const initialCenter: [number, number] = isMobile ? [22.2, 82.0] : [22.8, 82.5];

    let map: L.Map;
    try {
      map = L.map(container, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
        maxBounds: [
          [0, 55],
          [42, 110],
        ],
        maxBoundsViscosity: 0.6,
      });
    } catch (err) {
      console.error("[StormMap] Leaflet failed to initialise:", err);
      setMapError(err instanceof Error ? err.message : "Unknown error");
      return;
    }

    stationLayerRef.current = L.layerGroup().addTo(map);
    dwrLayerRef.current = L.layerGroup().addTo(map);
    stormLayerRef.current = L.layerGroup().addTo(map);
    lightningLayerRef.current = L.layerGroup().addTo(map);
    riskZonesLayerRef.current = L.layerGroup().addTo(map);

    resetToIndiaView(map, false);
    mapRef.current = map;
    setMapReady(true);

    // Keep the map correctly sized when the window / panels change size
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    const t = setTimeout(() => {
      map.invalidateSize();
      resetToIndiaView(map, false);
    }, 150);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      baseLayersRef.current = [];
      setMapReady(false);
    };
  }, []);

  // ── Default to full India view whenever Nowcast tab is active ─────
  useEffect(() => {
    if (isActive && mapRef.current) {
      const map = mapRef.current;
      const t = setTimeout(() => {
        map.invalidateSize();
        resetToIndiaView(map, false);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isActive, mapReady]);

  // ── 2. Basemap: Streets (OSM) vs Satellite (Esri) ─────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    baseLayersRef.current.forEach((l) => map.removeLayer(l));

    const layers: L.Layer[] =
      mapMode === "satellite"
        ? [
            L.tileLayer(ESRI_IMAGERY_URL, { attribution: ESRI_ATTR, maxZoom: 18 }),
            L.tileLayer(ESRI_LABELS_URL, { maxZoom: 18, pane: "overlayPane" }),
          ]
        : [L.tileLayer(OSM_URL, { attribution: OSM_ATTR, maxZoom: 19, subdomains: "abc" })];

    layers.forEach((l) => {
      l.addTo(map);
      (l as L.TileLayer).bringToBack?.();
    });
    baseLayersRef.current = layers;
  }, [mapReady, mapMode]);

  const handleToggleBasemap = (mode: "streets" | "satellite") => setMapMode(mode);

  // ── Center on India Button ────────────────────────────────────────
  const handleResetToIndia = () => {
    if (!mapRef.current) return;
    resetToIndiaView(mapRef.current, true);
  };

  const handleZoom = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.setZoom(map.getZoom() + delta);
  };

  // ── External Camera Fly-To ────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !flyToCoord) return;
    mapRef.current?.flyTo([flyToCoord.lat, flyToCoord.lon], 7, { duration: 1.2 });
  }, [mapReady, flyToCoord]);

  // ── Render DWR Radars and Range Rings ─────────────────────────────
  useEffect(() => {
    const group = dwrLayerRef.current;
    if (!mapReady || !group) return;

    group.clearLayers();
    if (!activeLayers.radarRings) return;

    IMD_DWR_NETWORK.forEach((dwr) => {
      L.circle([dwr.lat, dwr.lon], {
        radius: dwr.rangeKm * 1000,
        color: mapMode === "satellite" ? "#38bdf8" : "#0284c7",
        opacity: 0.85,
        weight: 1.5,
        fillColor: "#0284c7",
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(group);

      const html = `
        <div style="
          width: 24px; height: 24px; background: #0284c7; border: 2px solid #ffffff;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        " title="${dwr.name} (${dwr.band}) - ${dwr.rangeKm}km">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/></svg>
        </div>
      `;

      const popup = `
        <div style="font-family: system-ui, sans-serif; padding: 2px;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${dwr.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${dwr.city}, ${dwr.state}</div>
          <div style="display: flex; gap: 8px; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <span>Band: <strong>${dwr.band}</strong></span>
            <span>Radius: <strong>${dwr.rangeKm} km</strong></span>
          </div>
          <div style="font-size: 10px; color: #16a34a; font-weight: 600; margin-top: 4px;">● ${dwr.status}</div>
        </div>
      `;

      L.marker([dwr.lat, dwr.lon], { icon: htmlIcon(html, [24, 24], [12, 12]) })
        .bindPopup(popup)
        .addTo(group);
    });
  }, [mapReady, activeLayers.radarRings, mapMode]);

  // ── Render Weather Station Markers ────────────────────────────────
  useEffect(() => {
    const group = stationLayerRef.current;
    if (!mapReady || !group) return;

    group.clearLayers();

    weatherData.forEach((st) => {
      const riskBg =
        st.riskLevel === "RED"
          ? "#dc2626"
          : st.riskLevel === "ORANGE"
          ? "#ea580c"
          : st.riskLevel === "YELLOW"
          ? "#ca8a04"
          : "#16a34a";

      const isSelected = selectedStation?.stationId === st.stationId;
      const isSevere = st.riskLevel === "RED" || st.riskLevel === "ORANGE";

      const html = `
        <div style="position: relative; display: inline-flex; align-items: center; justify-content: center;">
          ${
            isSevere
              ? `<span style="
                  position: absolute; inset: -4px; border-radius: 14px;
                  border: 2px solid ${riskBg}; opacity: 0.75;
                  animation: pulse 1.8s infinite; pointer-events: none;
                "></span>`
              : ""
          }
          <div style="
            display: inline-flex; align-items: center; gap: 4px; background: #ffffff;
            border: 1.5px solid ${isSelected ? "#0284c7" : isSevere ? riskBg : "#cbd5e1"};
            padding: 2px 7px; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            font-family: system-ui, -apple-system, sans-serif; white-space: nowrap;
            ${isSelected ? "transform: scale(1.1); box-shadow: 0 0 0 3px rgba(2,132,199,0.35);" : ""}
          ">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${riskBg}; display: inline-block;"></span>
            <span style="font-size: 11px; font-weight: 700; color: #0f172a;">${st.temp}°C</span>
          </div>
        </div>
      `;

      L.marker([st.lat, st.lon], { icon: htmlIcon(html, [56, 22], [28, 11]) })
        .on("click", () => {
          onSelectStation(st);
          mapRef.current?.flyTo([st.lat, st.lon], 7, { duration: 1.0 });
        })
        .addTo(group);
    });
  }, [mapReady, weatherData, selectedStation, onSelectStation]);

  // ── Render Convective Storm Cells ─────────────────────────────────
  useEffect(() => {
    const group = stormLayerRef.current;
    if (!mapReady || !group) return;

    group.clearLayers();
    if (!nowcast) return;

    nowcast.storm_cards.forEach((storm) => {
      const isSelected = selectedStorm?.id === storm.id;
      const isExtreme = storm.severity === "EXTREME";
      const color =
        storm.severity === "EXTREME"
          ? "#dc2626"
          : storm.severity === "SEVERE"
          ? "#ea580c"
          : "#ca8a04";

      const html = `
        <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
          ${
            isExtreme
              ? `<div style="
                  position: absolute; top: -3px; width: 68px; height: 26px; border-radius: 8px;
                  border: 2px solid #dc2626; opacity: 0.8;
                  animation: pulse 1.4s infinite; pointer-events: none;
                "></div>`
              : ""
          }
          <div style="
            background: ${color}; color: #ffffff; font-size: 11px; font-weight: 800;
            padding: 3px 8px; border-radius: 6px; border: 1.5px solid #ffffff;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px;
            font-family: system-ui, sans-serif; white-space: nowrap;
            ${isSelected ? "transform: scale(1.15); box-shadow: 0 0 0 3px rgba(2,132,199,0.5);" : ""}
          ">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span>${storm.max_reflectivity.toFixed(0)} dBZ</span>
          </div>
          <div style="
            font-size: 10px; font-weight: 700; color: #0f172a; background: #ffffff;
            border: 1px solid #cbd5e1; padding: 1px 6px; border-radius: 4px; margin-top: 3px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.12); white-space: nowrap; font-family: system-ui, sans-serif;
          ">${storm.nearest_district ?? storm.id}</div>
        </div>
      `;

      L.marker([storm.lat, storm.lon], { icon: htmlIcon(html, [80, 44], [40, 22]) })
        .on("click", () => onStormSelect(isSelected ? null : storm))
        .addTo(group);
    });
  }, [mapReady, nowcast, selectedStorm, onStormSelect]);

  // ── Render Lightning Strikes ──────────────────────────────────────
  useEffect(() => {
    const group = lightningLayerRef.current;
    if (!mapReady || !group || !activeLayers.lightning || lightning.length === 0) return;

    lightning.slice(-2).forEach((strike) => {
      const html = `
        <div style="
          width: 10px; height: 10px; border-radius: 50%; background: #eab308;
          border: 2px solid #ffffff; box-shadow: 0 0 8px rgba(234, 179, 8, 0.9);
        "></div>
      `;
      const m = L.marker([strike.lat, strike.lon], {
        icon: htmlIcon(html, [14, 14], [7, 7]),
        interactive: false,
      }).addTo(group);
      setTimeout(() => group.removeLayer(m), 2200);
    });
  }, [mapReady, lightning, activeLayers.lightning]);

  // ── Render AI Thunderstorm Risk Layer (Geographic Zones) ──────────
  useEffect(() => {
    const group = riskZonesLayerRef.current;
    if (!mapReady || !group) return;

    group.clearLayers();
    if (!activeLayers.riskZones) return;

    AI_RISK_ZONES.forEach((zone) => {
      const color =
        zone.riskLevel === "Severe"
          ? "#dc2626"
          : zone.riskLevel === "High"
          ? "#ea580c"
          : zone.riskLevel === "Moderate"
          ? "#ca8a04"
          : "#16a34a";

      const poly = L.polygon(zone.polygon, {
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: mapMode === "satellite" ? 0.28 : 0.22,
        dashArray: zone.riskLevel === "Severe" ? undefined : "5, 5",
      });

      poly.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedRiskZone(zone);
        mapRef.current?.flyTo(zone.center, 7, { duration: 1.0 });
      });

      poly.addTo(group);

      // Centered zone badge
      const badgeHtml = `
        <div style="
          background: ${color}; color: #ffffff; font-size: 10px; font-weight: 800;
          padding: 2px 8px; border-radius: 9999px; border: 1.5px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35); text-transform: uppercase;
          white-space: nowrap; cursor: pointer; letter-spacing: 0.03em;
          display: inline-flex; align-items: center; gap: 4px;
        ">
          <span style="width: 5px; height: 5px; border-radius: 50%; background: #ffffff;"></span>
          <span>${zone.riskLevel} Risk</span>
        </div>
      `;

      const marker = L.marker(zone.center, {
        icon: htmlIcon(badgeHtml, [90, 20], [45, 10]),
      });
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedRiskZone(zone);
        mapRef.current?.flyTo(zone.center, 7, { duration: 1.0 });
      });
      marker.addTo(group);
    });
  }, [mapReady, activeLayers.riskZones, mapMode]);

  // ── Map Click to Query AI Risk at Any Location ────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // Find closest zone
      let closest = AI_RISK_ZONES[0];
      let minDist = Infinity;
      AI_RISK_ZONES.forEach((z) => {
        const d = getDistanceKm(e.latlng.lat, e.latlng.lng, z.center[0], z.center[1]);
        if (d < minDist) {
          minDist = d;
          closest = z;
        }
      });

      if (minDist <= 160) {
        setSelectedRiskZone(closest);
      } else {
        const synthesizedZone: RiskZone = {
          id: `QUERY-${Math.round(e.latlng.lat)}-${Math.round(e.latlng.lng)}`,
          name: `Point Query (${e.latlng.lat.toFixed(1)}°N, ${e.latlng.lng.toFixed(1)}°E)`,
          location: `Selected Geographic Sector (${e.latlng.lat.toFixed(2)}°N, ${e.latlng.lng.toFixed(2)}°E)`,
          region: "Indian Subcontinent",
          riskLevel: "Low",
          thunderstormProb: 24,
          lightningProb: 16,
          expectedArrivalMin: 90,
          stormDirection: "Variable (Westerly)",
          center: [e.latlng.lat, e.latlng.lng],
          polygon: [],
          primaryThreats: ["Fair Weather / Isolated Cloudiness"],
        };
        setSelectedRiskZone(synthesizedZone);
      }
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [mapReady]);

  // NOTE: this project does not compile Tailwind utilities (globals.css is plain CSS),
  // so all layout below uses inline styles + the existing .esam-card class.
  const btnBase: React.CSSProperties = {
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "inherit",
  };
  const pill = (active: boolean): React.CSSProperties => ({
    ...btnBase,
    background: active ? "var(--clr-primary-800, #2E7D32)" : "transparent",
    color: active ? "#ffffff" : "var(--clr-gray-900, #1E1E1B)",
    fontWeight: active ? 700 : 600,
  });
  const floatBox: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid var(--clr-primary-200, #C8E6C9)",
    borderRadius: 8,
    boxShadow: "var(--shadow-card, 0 2px 8px rgba(0,0,0,0.08))",
  };
  const tile: React.CSSProperties = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 10,
  };
  const tileLabel: React.CSSProperties = { fontSize: 10, color: "var(--clr-gray-500, #737370)", fontWeight: 500, display: "block" };
  const tileValue: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "var(--clr-gray-900, #1E1E1B)", display: "block" };
  const tileSub: React.CSSProperties = { fontSize: 10, color: "var(--clr-gray-500, #737370)", display: "block" };

  return (
    <div style={{ position: "absolute", inset: 0, background: "#f8fafc", overflow: "hidden" }}>
      {/* Map canvas (explicit size + own stacking context so Leaflet panes stay below the overlays) */}
      <div ref={mapContainerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, background: "#f8fafc" }} />

      {/* Map init error */}
      {mapError && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(248,250,252,0.92)", padding: 24 }}>
          <div className="esam-card" style={{ maxWidth: 440, padding: 20, fontSize: 14, color: "#0f172a" }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Map could not be loaded</div>
            <div style={{ fontSize: 12, color: "#475569" }}>{mapError}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              Please refresh the page. The map uses free OpenStreetMap tiles, so an internet connection is required.
            </div>
          </div>
        </div>
      )}

      {/* Top-centre controls: Map / Satellite, India view, zoom (between the side panels) */}
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ ...floatBox, padding: 2, display: "flex", alignItems: "center" }}>
          <button onClick={() => handleToggleBasemap("streets")} style={pill(mapMode === "streets")}>
            <span>Map</span>
          </button>
          <button onClick={() => handleToggleBasemap("satellite")} style={pill(mapMode === "satellite")}>
            <span>Satellite</span>
          </button>
        </div>
        <button onClick={handleResetToIndia} title="Reset view to India" style={{ ...floatBox, ...btnBase, color: "var(--clr-gray-900, #1E1E1B)", padding: "8px 14px" }}>
          <span>India View</span>
        </button>
        <div style={{ ...floatBox, display: "flex", overflow: "hidden" }}>
          <button onClick={() => handleZoom(1)} title="Zoom in" style={{ ...btnBase, borderRadius: 0, color: "var(--clr-gray-900, #1E1E1B)", fontSize: 16, padding: "4px 12px", background: "transparent" }}>+</button>
          <button onClick={() => handleZoom(-1)} title="Zoom out" style={{ ...btnBase, borderRadius: 0, color: "var(--clr-gray-900, #1E1E1B)", fontSize: 16, padding: "4px 12px", background: "transparent", borderLeft: "1px solid var(--clr-primary-200, #C8E6C9)" }}>−</button>
        </div>
      </div>

      {/* Selected station card (placed to the right of the left panel) */}
      {selectedStation && (() => {
        const nearestRadar = findNearestRadar(selectedStation.lat, selectedStation.lon);
        return (
          <div className="esam-card station-inspector-card" style={{ zIndex: 10, padding: 14, boxShadow: "var(--shadow-elevated, 0 8px 30px rgba(0,0,0,0.15))", border: "1px solid var(--clr-primary-200, #C8E6C9)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--clr-primary-900, #1B5E20)" }}>{selectedStation.name}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--clr-gray-500, #737370)" }}>
                  {selectedStation.state} · {selectedStation.lat.toFixed(2)}°N, {selectedStation.lon.toFixed(2)}°E
                </div>
              </div>
              <button
                onClick={() => onSelectStation(null)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--clr-gray-400, #9E9E98)", fontWeight: 700, fontSize: 14, padding: "2px 4px" }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Nearest Radar info */}
            <div style={{ marginTop: 8, padding: "5px 8px", background: "var(--clr-primary-50, #EDF7EE)", borderRadius: 6, border: "1px solid var(--clr-primary-200, #C8E6C9)", fontSize: 10, color: "var(--clr-primary-900, #1B5E20)", display: "flex", justifyContent: "space-between" }}>
              <span>📡 <strong>{nearestRadar.radar.name}</strong> ({nearestRadar.radar.band})</span>
              <span style={{ fontWeight: 700, color: "var(--clr-primary-800, #2E7D32)" }}>{nearestRadar.distanceKm} km</span>
            </div>

            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div style={tile}>
                <span style={tileLabel}>TEMPERATURE</span>
                <span style={tileValue}>{selectedStation.temp}°C</span>
                <span style={tileSub}>Humidity {selectedStation.humidity}%</span>
              </div>
              <div style={tile}>
                <span style={tileLabel}>INSTABILITY (CAPE)</span>
                <span style={{ ...tileValue, color: selectedStation.cape >= 1500 ? "#e11d48" : selectedStation.cape >= 800 ? "#d97706" : "var(--clr-primary-800, #2E7D32)" }}>
                  {selectedStation.cape} J/kg
                </span>
                <span style={tileSub}>LI {selectedStation.liftedIndex}°C</span>
              </div>
              <div style={tile}>
                <span style={tileLabel}>SURFACE WIND</span>
                <span style={{ ...tileValue, fontSize: 13 }}>{selectedStation.windSpeed} km/h</span>
                <span style={tileSub}>Heading {selectedStation.windDirection}°</span>
              </div>
              <div style={tile}>
                <span style={tileLabel}>PRECIPITATION</span>
                <span style={{ ...tileValue, fontSize: 13, color: selectedStation.precipitation > 0 ? "var(--clr-primary-800, #2E7D32)" : "var(--clr-gray-700, #3E3E38)" }}>
                  {selectedStation.precipitation > 0 ? `${selectedStation.precipitation} mm/h` : "Nil"}
                </span>
                <span style={tileSub}>Cloud {selectedStation.cloudCover}%</span>
              </div>
            </div>

            <div style={{ marginTop: 8, padding: "6px 8px", borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
              <span style={{ color: "var(--clr-gray-600, #575752)", fontWeight: 600 }}>IMD Warning:</span>
              <span
                className={
                  selectedStation.riskLevel === "RED" ? "badge-red"
                  : selectedStation.riskLevel === "ORANGE" ? "badge-orange"
                  : selectedStation.riskLevel === "YELLOW" ? "badge-yellow"
                  : "badge-green"
                }
                style={{ fontWeight: 700, padding: "2px 8px", borderRadius: 4, fontSize: 11 }}
              >
                {selectedStation.riskLabel}
              </span>
            </div>

            <button
              onClick={() => mapRef.current?.flyTo([selectedStation.lat, selectedStation.lon], 8, { duration: 1.0 })}
              style={{
                width: "100%",
                marginTop: 8,
                padding: "7px 10px",
                borderRadius: 6,
                backgroundColor: "var(--clr-primary-800, #2E7D32)",
                color: "#ffffff",
                border: "none",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "var(--shadow-card)",
              }}
            >
              Locate Station on Map
            </button>
          </div>
        );
      })()}

      {/* Selected Storm Early Warning Cell Inspector (placed to the left of the right panel) */}
      {selectedStorm && (
        <div className="esam-card storm-inspector-card" style={{ zIndex: 10, padding: 14, boxShadow: "0 8px 30px rgba(220,38,38,0.18)", border: "1.5px solid #fca5a5" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#b91c1c" }}>{selectedStorm.id}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 9999,
                    backgroundColor: selectedStorm.severity === "EXTREME" ? "#dc2626" : "#ea580c",
                    color: "#ffffff",
                    textTransform: "uppercase",
                  }}
                >
                  IMD {selectedStorm.severity}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                {selectedStorm.nearest_district ?? "District Sector"}
              </div>
            </div>
            <button
              onClick={() => onStormSelect(null)}
              style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", fontWeight: 700, fontSize: 14, padding: "2px 4px" }}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #fee2e2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={{ ...tile, backgroundColor: "#fff5f5", borderColor: "#fecaca" }}>
              <span style={tileLabel}>MAX REFLECTIVITY</span>
              <span style={{ ...tileValue, color: "#dc2626" }}>{selectedStorm.max_reflectivity.toFixed(1)} dBZ</span>
              <span style={{ ...tileSub, color: "#b91c1c", fontWeight: 600 }}>Hail Potential &gt;80%</span>
            </div>
            <div style={{ ...tile, backgroundColor: "#fff5f5", borderColor: "#fecaca" }}>
              <span style={tileLabel}>ARRIVAL ETA</span>
              <span style={{ ...tileValue, color: "#c2410c" }}>
                {selectedStorm.eta_minutes ? `~${Math.round(selectedStorm.eta_minutes)}m` : "Imminent"}
              </span>
              <span style={tileSub}>{selectedStorm.speed_kmh.toFixed(0)} km/h · {getCompassDirection(selectedStorm.direction_deg)}</span>
            </div>
          </div>

          <div style={{ marginTop: 8, padding: "6px 8px", borderRadius: 6, backgroundColor: "#fef2f2", border: "1px solid #fecaca", fontSize: 10, color: "#991b1b", lineHeight: 1.4 }}>
            ⚡ <strong>Severe Convection Warning:</strong> Dangerous ground lightning strikes & squall winds. Seek immediate indoor masonry shelter.
          </div>

          <button
            onClick={() => mapRef.current?.flyTo([selectedStorm.lat, selectedStorm.lon], 8, { duration: 1.0 })}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "6px 10px",
              borderRadius: 6,
              backgroundColor: "#dc2626",
              color: "#ffffff",
              border: "none",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Locate Storm Cell on Map
          </button>
        </div>
      )}

      {/* ── Compact Information Panel for AI Thunderstorm Risk Layer ── */}
      {selectedRiskZone && (
        <div
          className="esam-card"
          style={{
            position: "absolute",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            width: 320,
            padding: "14px 16px",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: `1.5px solid ${
              selectedRiskZone.riskLevel === "Severe"
                ? "#dc2626"
                : selectedRiskZone.riskLevel === "High"
                ? "#ea580c"
                : selectedRiskZone.riskLevel === "Moderate"
                ? "#ca8a04"
                : "#16a34a"
            }`,
            boxShadow: "0 10px 32px rgba(9, 13, 22, 0.22)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                AI Thunderstorm Risk Layer
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                Location: {selectedRiskZone.location}
              </div>
            </div>
            <button
              onClick={() => setSelectedRiskZone(null)}
              style={{ border: "none", background: "transparent", cursor: "pointer", color: "#64748b", fontWeight: 700, fontSize: 14, padding: "2px 4px" }}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#475569", fontWeight: 500 }}>Thunderstorm Probability:</span>
              <strong style={{ color: selectedRiskZone.thunderstormProb >= 75 ? "#dc2626" : selectedRiskZone.thunderstormProb >= 50 ? "#ea580c" : "#16a34a", fontSize: 13 }}>
                {selectedRiskZone.thunderstormProb}%
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#475569", fontWeight: 500 }}>Lightning Probability:</span>
              <strong style={{ color: selectedRiskZone.lightningProb >= 65 ? "#dc2626" : selectedRiskZone.lightningProb >= 40 ? "#d97706" : "#16a34a", fontSize: 13 }}>
                {selectedRiskZone.lightningProb}%
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#475569", fontWeight: 500 }}>Risk Level:</span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 800,
                  backgroundColor:
                    selectedRiskZone.riskLevel === "Severe"
                      ? "#fee2e2"
                      : selectedRiskZone.riskLevel === "High"
                      ? "#ffedd5"
                      : selectedRiskZone.riskLevel === "Moderate"
                      ? "#fef9c3"
                      : "#dcfce7",
                  color:
                    selectedRiskZone.riskLevel === "Severe"
                      ? "#991b1b"
                      : selectedRiskZone.riskLevel === "High"
                      ? "#9a3412"
                      : selectedRiskZone.riskLevel === "Moderate"
                      ? "#854d0e"
                      : "#166534",
                }}
              >
                {selectedRiskZone.riskLevel}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#475569", fontWeight: 500 }}>Expected Arrival:</span>
              <strong style={{ color: "#0f172a" }}>
                {selectedRiskZone.expectedArrivalMin} minutes
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--clr-gray-600, #575752)", fontWeight: 500 }}>Storm Direction:</span>
              <strong style={{ color: "var(--clr-primary-800, #2E7D32)" }}>
                {selectedRiskZone.stormDirection}
              </strong>
            </div>
          </div>

          <div style={{ marginTop: 8, padding: "5px 8px", borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 10, color: "var(--clr-gray-600, #575752)" }}>
            <strong>Primary Threats:</strong> {selectedRiskZone.primaryThreats.join(" · ")}
          </div>

          <button
            onClick={() => mapRef.current?.flyTo(selectedRiskZone.center, 7, { duration: 1.0 })}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "7px 10px",
              borderRadius: 6,
              backgroundColor: "var(--clr-primary-800, #2E7D32)",
              color: "#ffffff",
              border: "none",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "var(--shadow-card)",
            }}
          >
            Center on Risk Zone
          </button>
        </div>
      )}

      {/* Sleek Map Legends (centered above the scrubber, perfectly balanced between panels) */}
      <div
        className="map-legend-bar"
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          alignItems: "center",
          gap: 16,
          padding: "5px 14px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--clr-primary-200, #C8E6C9)",
          borderRadius: "9999px",
          boxShadow: "var(--shadow-card, 0 4px 16px rgba(0, 0, 0, 0.08))",
          userSelect: "none",
        }}
      >
        {/* dBZ Reflectivity */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
            Reflectivity:
          </span>
          <div style={{ display: "flex", height: 8, width: 110, borderRadius: 3, overflow: "hidden", border: "1px solid #cbd5e1" }}>
            {["#3b82f6", "#10b981", "#eab308", "#f97316", "#ef4444", "#a855f7"].map((c) => (
              <div key={c} style={{ flex: 1, background: c }} />
            ))}
          </div>
          <span style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", fontWeight: 700 }}>
            15 - 65+ dBZ
          </span>
        </div>

        <div style={{ width: 1, height: 12, backgroundColor: "#E2E8F0" }} />

        {/* IMD Alert scale */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
            Alerts:
          </span>
          {[["#10b981", "Normal"], ["#f59e0b", "Watch"], ["#f97316", "Alert"], ["#e11d48", "Warning"]].map(([c, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#475569" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
