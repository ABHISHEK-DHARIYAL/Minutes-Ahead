"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { NowcastData, StormCard } from "@/app/page";
import { LiveWeatherData, IMD_DWR_NETWORK } from "@/data/indiaData";

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

const INDIA_CENTER: [number, number] = [22.2, 79.8];
// [[south, west], [north, east]]
const INDIA_BOUNDS: L.LatLngBoundsExpression = [
  [6.5, 68.0],
  [35.8, 97.5],
];
// Keep India inside the area that is NOT covered by the left/right side panels
const FIT_OPTIONS: L.FitBoundsOptions = {
  paddingTopLeft: [360, 70],
  paddingBottomRight: [360, 110],
};

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
}: StormMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayersRef = useRef<L.Layer[]>([]);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Basemap mode: 'streets' (OpenStreetMap) or 'satellite' (Esri imagery)
  const [mapMode, setMapMode] = useState<"streets" | "satellite">("streets");

  // One layer group per overlay type so each can be cleared independently
  const stationLayerRef = useRef<L.LayerGroup | null>(null);
  const dwrLayerRef = useRef<L.LayerGroup | null>(null);
  const stormLayerRef = useRef<L.LayerGroup | null>(null);
  const lightningLayerRef = useRef<L.LayerGroup | null>(null);

  const htmlIcon = (html: string, size: [number, number], anchor: [number, number]) =>
    L.divIcon({ html, className: "", iconSize: size, iconAnchor: anchor });

  // ── 1. Initialize Leaflet map ─────────────────────────────────────
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return;

    let map: L.Map;
    try {
      map = L.map(container, {
        center: INDIA_CENTER,
        zoom: 5,
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

    map.fitBounds(INDIA_BOUNDS, FIT_OPTIONS);
    mapRef.current = map;
    setMapReady(true);

    // Keep the map correctly sized when the window / panels change size
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    const t = setTimeout(() => map.invalidateSize(), 150);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      baseLayersRef.current = [];
      setMapReady(false);
    };
  }, []);

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
    mapRef.current?.fitBounds(INDIA_BOUNDS, FIT_OPTIONS);
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
          font-size: 11px; color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        " title="${dwr.name} (${dwr.band}) - ${dwr.rangeKm}km">📡</div>
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

      const html = `
        <div style="
          display: inline-flex; align-items: center; gap: 4px; background: #ffffff;
          border: 1.5px solid ${isSelected ? "#2e7d32" : "#cbd5e1"};
          padding: 2px 7px; border-radius: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          font-family: system-ui, -apple-system, sans-serif; white-space: nowrap;
        ">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: ${riskBg}; display: inline-block;"></span>
          <span style="font-size: 11px; font-weight: 700; color: #0f172a;">${st.temp}°C</span>
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
      const color =
        storm.severity === "EXTREME"
          ? "#dc2626"
          : storm.severity === "SEVERE"
          ? "#ea580c"
          : "#ca8a04";

      const html = `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="
            background: ${color}; color: #ffffff; font-size: 11px; font-weight: 700;
            padding: 3px 8px; border-radius: 6px; border: 1.5px solid #ffffff;
            box-shadow: 0 3px 10px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px;
            font-family: system-ui, sans-serif; white-space: nowrap;
            ${isSelected ? "transform: scale(1.15);" : ""}
          ">
            <span>⚡</span>
            <span>${storm.max_reflectivity.toFixed(0)} dBZ</span>
          </div>
          <div style="
            font-size: 10px; font-weight: 600; color: #0f172a; background: #ffffff;
            border: 1px solid #cbd5e1; padding: 1px 5px; border-radius: 4px; margin-top: 3px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1); white-space: nowrap; font-family: system-ui, sans-serif;
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
    background: active ? "#2e7d32" : "transparent",
    color: active ? "#ffffff" : "#475569",
  });
  const floatBox: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  };
  const tile: React.CSSProperties = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 10,
  };
  const tileLabel: React.CSSProperties = { fontSize: 10, color: "#64748b", fontWeight: 500, display: "block" };
  const tileValue: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "#0f172a", display: "block" };
  const tileSub: React.CSSProperties = { fontSize: 10, color: "#64748b", display: "block" };

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
            <span>🗺️</span><span>Map</span>
          </button>
          <button onClick={() => handleToggleBasemap("satellite")} style={pill(mapMode === "satellite")}>
            <span>🛰️</span><span>Satellite</span>
          </button>
        </div>
        <button onClick={handleResetToIndia} title="Reset view to India" style={{ ...floatBox, ...btnBase, color: "#0f172a", padding: "8px 12px" }}>
          <span>🎯</span><span>India View</span>
        </button>
        <div style={{ ...floatBox, display: "flex", overflow: "hidden" }}>
          <button onClick={() => handleZoom(1)} title="Zoom in" style={{ ...btnBase, borderRadius: 0, color: "#0f172a", fontSize: 16, padding: "4px 12px", background: "transparent" }}>+</button>
          <button onClick={() => handleZoom(-1)} title="Zoom out" style={{ ...btnBase, borderRadius: 0, color: "#0f172a", fontSize: 16, padding: "4px 12px", background: "transparent", borderLeft: "1px solid #e2e8f0" }}>−</button>
        </div>
      </div>

      {/* Selected station card (placed to the right of the left panel) */}
      {selectedStation && (
        <div className="esam-card" style={{ position: "absolute", top: 60, left: 348, zIndex: 10, width: 300, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{selectedStation.name}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {selectedStation.state} · {selectedStation.lat.toFixed(2)}°N, {selectedStation.lon.toFixed(2)}°E
              </div>
            </div>
            <button onClick={() => onSelectStation(null)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", fontWeight: 700, fontSize: 14 }}>✕</button>
          </div>

          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={tile}>
              <span style={tileLabel}>TEMPERATURE</span>
              <span style={tileValue}>{selectedStation.temp}°C</span>
              <span style={tileSub}>Humidity {selectedStation.humidity}%</span>
            </div>
            <div style={tile}>
              <span style={tileLabel}>INSTABILITY (CAPE)</span>
              <span style={{ ...tileValue, color: selectedStation.cape >= 1500 ? "#e11d48" : selectedStation.cape >= 800 ? "#d97706" : "#059669" }}>
                {selectedStation.cape} J/kg
              </span>
              <span style={tileSub}>LI {selectedStation.liftedIndex}°C</span>
            </div>
            <div style={tile}>
              <span style={tileLabel}>SURFACE WIND</span>
              <span style={{ ...tileValue, fontSize: 14 }}>{selectedStation.windSpeed} km/h</span>
              <span style={tileSub}>Direction {selectedStation.windDirection}°</span>
            </div>
            <div style={tile}>
              <span style={tileLabel}>PRECIPITATION</span>
              <span style={{ ...tileValue, fontSize: 14 }}>
                {selectedStation.precipitation > 0 ? `${selectedStation.precipitation} mm/h` : "Nil"}
              </span>
              <span style={tileSub}>Cloud {selectedStation.cloudCover}%</span>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
            <span style={{ color: "#475569", fontWeight: 500 }}>IMD Warning Level:</span>
            <span
              className={
                selectedStation.riskLevel === "RED" ? "badge-red"
                : selectedStation.riskLevel === "ORANGE" ? "badge-orange"
                : selectedStation.riskLevel === "YELLOW" ? "badge-yellow"
                : "badge-green"
              }
              style={{ fontWeight: 600, padding: "2px 8px", borderRadius: 4, fontSize: 12 }}
            >
              {selectedStation.riskLabel}
            </span>
          </div>
        </div>
      )}

      {/* Legends (bottom, between the side panels, above the time scrubber) */}
      <div style={{ position: "absolute", bottom: 84, left: 348, zIndex: 10, display: "flex", gap: 8 }}>
        <div className="esam-card" style={{ padding: "8px 14px", fontSize: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
            Radar Reflectivity (dBZ)
          </div>
          <div style={{ display: "flex", height: 10, width: 176, borderRadius: 4, overflow: "hidden", border: "1px solid #cbd5e1" }}>
            {["#3b82f6", "#10b981", "#eab308", "#f97316", "#ef4444", "#a855f7"].map((c) => (
              <div key={c} style={{ flex: 1, background: c }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#64748b", marginTop: 4, fontFamily: "monospace", fontWeight: 600 }}>
            <span>15</span><span>30</span><span>45</span><span>60+</span>
          </div>
        </div>

        <div className="esam-card" style={{ padding: "8px 14px", fontSize: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
            IMD Alert Scale
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10, fontWeight: 600, color: "#475569" }}>
            {[["#10b981", "Normal"], ["#f59e0b", "Watch"], ["#f97316", "Alert"], ["#e11d48", "Warning"]].map(([c, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
