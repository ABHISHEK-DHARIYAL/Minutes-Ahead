"use client";
import { useState, useMemo, useEffect } from "react";
import { LiveWeatherData, getWeatherConditionName, IMD_DWR_NETWORK, DWRStation } from "@/data/indiaData";
import { CURRENT_ATMOSPHERIC_CONDITIONS, OBSERVATION_DATA_SOURCES } from "@/data/riskZonesData";

interface LeftPanelProps {
  weatherData: LiveWeatherData[];
  onSelectStation: (st: LiveWeatherData) => void;
  selectedStation: LiveWeatherData | null;
  activeLayers: Record<string, boolean>;
  onToggleLayer: (layerId: string) => void;
  activeTabOverride?: "stations" | "atmosphere" | "sources" | "radars" | "layers";
  isCollapsedOverride?: boolean;
  onCloseMobile?: () => void;
}

// Haversine distance calculator to find nearest operational Doppler Weather Radar
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

function findNearestRadar(lat: number, lon: number): { radar: DWRStation; distanceKm: number } {
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

// Weather condition emoji/icon helper
function getWeatherIcon(code: number): string {
  if (code >= 95) return "⛈️"; // Severe thunderstorm
  if (code >= 91) return "🌩️"; // Thunderstorm with rain
  if (code >= 80 || code >= 61) return "🌧️"; // Rain / showers
  if (code >= 51) return "🌦️"; // Drizzle
  if (code === 45 || code === 48) return "🌫️"; // Fog
  if (code === 3) return "☁️"; // Overcast
  if (code === 1 || code === 2) return "⛅"; // Partly cloudy
  return "☀️"; // Clear
}

export default function LeftPanel({
  weatherData,
  onSelectStation,
  selectedStation,
  activeLayers,
  onToggleLayer,
  activeTabOverride,
  isCollapsedOverride,
  onCloseMobile,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<"stations" | "atmosphere" | "sources" | "radars" | "layers">("stations");
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "RED" | "ORANGE" | "YELLOW" | "GREEN">("ALL");
  const [sortBy, setSortBy] = useState<"risk" | "cape" | "rain" | "temp">("risk");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (activeTabOverride) {
      setActiveTab(activeTabOverride);
      setIsCollapsed(false);
    }
  }, [activeTabOverride]);

  useEffect(() => {
    if (isCollapsedOverride !== undefined) {
      setIsCollapsed(isCollapsedOverride);
    }
  }, [isCollapsedOverride]);

  // Network-wide metrics
  const totalStations = weatherData.length;
  const severeCount = useMemo(
    () => weatherData.filter((s) => s.riskLevel === "RED" || s.riskLevel === "ORANGE").length,
    [weatherData]
  );
  const rainCount = useMemo(() => weatherData.filter((s) => s.precipitation > 0).length, [weatherData]);
  const avgTemp = useMemo(() => {
    if (!weatherData.length) return 0;
    const sum = weatherData.reduce((acc, s) => acc + s.temp, 0);
    return (sum / weatherData.length).toFixed(1);
  }, [weatherData]);

  // Risk counts for filter badges
  const riskCounts = useMemo(() => {
    return {
      ALL: weatherData.length,
      RED: weatherData.filter((s) => s.riskLevel === "RED").length,
      ORANGE: weatherData.filter((s) => s.riskLevel === "ORANGE").length,
      YELLOW: weatherData.filter((s) => s.riskLevel === "YELLOW").length,
      GREEN: weatherData.filter((s) => s.riskLevel === "GREEN").length,
    };
  }, [weatherData]);

  // Filtered and sorted stations
  const filteredStations = useMemo(() => {
    const list = weatherData.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.stationId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === "ALL" || s.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });

    return list.sort((a, b) => {
      if (sortBy === "cape") return b.cape - a.cape;
      if (sortBy === "rain") return b.precipitation - a.precipitation;
      if (sortBy === "temp") return b.temp - a.temp;
      // Default: risk priority (RED > ORANGE > YELLOW > GREEN)
      const rank = { RED: 4, ORANGE: 3, YELLOW: 2, GREEN: 1 };
      return rank[b.riskLevel] - rank[a.riskLevel];
    });
  }, [weatherData, searchQuery, riskFilter, sortBy]);

  // Nearest radar to selected station
  const nearestRadarInfo = useMemo(() => {
    if (!selectedStation) return null;
    return findNearestRadar(selectedStation.lat, selectedStation.lon);
  }, [selectedStation]);

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        style={{
          padding: "10px 14px",
          backgroundColor: "#ffffff",
          border: "1.5px solid var(--clr-primary-300, #A5D6A7)",
          borderRadius: "10px",
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--clr-primary-900, #1B5E20)",
          cursor: "pointer",
          boxShadow: "var(--shadow-card, 0 4px 14px rgba(46,125,50,0.12))",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        title="Open Observation Stations Panel"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--clr-primary-800, #2E7D32)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span>Observatory Stations ({weatherData.length})</span>
        <span>→</span>
      </button>
    );
  }

  return (
    <aside
      style={{
        width: "min(330px, calc(100vw - 28px))",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid var(--clr-primary-200, #C8E6C9)",
        borderRadius: "12px",
        boxShadow: "var(--shadow-elevated, 0 8px 30px rgba(0,0,0,0.08))",
        overflow: "hidden",
      }}
    >
      {/* ── 1. Header & Live Network Status ─────────────────────────── */}
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid var(--clr-primary-100, #E8F5E9)",
          backgroundColor: "var(--clr-primary-50, #EDF7EE)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--clr-primary-800, #2E7D32)",
                border: "1px solid var(--clr-primary-200, #C8E6C9)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)", letterSpacing: "0.02em" }}>
                OBSERVATION STATIONS
              </div>
              <div style={{ fontSize: "10px", color: "var(--clr-primary-800, #2E7D32)", fontWeight: 600 }}>
                IMD AWS & Synoptic Network ({totalStations})
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCollapsed(true);
              if (onCloseMobile) onCloseMobile();
            }}
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--clr-primary-200, #C8E6C9)",
              color: "var(--clr-primary-900, #1B5E20)",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              padding: "4px 9px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            title="Back to Map / मैप पर लौटें"
          >
            <span style={{ fontSize: "12px" }}>✕</span>
            <span>Map</span>
          </button>
        </div>

        {/* Real-time National Synoptic Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "6px",
            backgroundColor: "#FFFFFF",
            padding: "6px 8px",
            borderRadius: "8px",
            border: "1px solid var(--clr-primary-200, #C8E6C9)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "9px", color: "var(--clr-gray-500, #737370)", fontWeight: 700, display: "block" }}>ALERTS</span>
            <span style={{ fontSize: "13px", fontWeight: 800, color: severeCount > 0 ? "#DC2626" : "#16A34A" }}>
              {severeCount} High
            </span>
          </div>
          <div style={{ textAlign: "center", borderLeft: "1px solid var(--clr-primary-100, #E8F5E9)", borderRight: "1px solid var(--clr-primary-100, #E8F5E9)" }}>
            <span style={{ fontSize: "9px", color: "var(--clr-gray-500, #737370)", fontWeight: 700, display: "block" }}>RAIN</span>
            <span style={{ fontSize: "13px", fontWeight: 800, color: rainCount > 0 ? "var(--clr-primary-800, #2E7D32)" : "#64748B" }}>
              {rainCount} Active
            </span>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "9px", color: "var(--clr-gray-500, #737370)", fontWeight: 700, display: "block" }}>AVG TEMP</span>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)" }}>
              {avgTemp}°C
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Tabs Navigation ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          borderBottom: "1px solid var(--clr-primary-200, #C8E6C9)",
          backgroundColor: "#ffffff",
          padding: "0 2px",
        }}
      >
        {[
          { id: "stations", label: `Stations (${filteredStations.length})` },
          { id: "atmosphere", label: "Atmosphere" },
          { id: "sources", label: "Data Sources" },
          { id: "radars", label: `Radars (${IMD_DWR_NETWORK.length})` },
          { id: "layers", label: "Layers" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "10px 8px",
              textAlign: "center",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === tab.id ? "2.5px solid var(--clr-primary-800, #2E7D32)" : "2.5px solid transparent",
              backgroundColor: activeTab === tab.id ? "var(--clr-primary-50, #EDF7EE)" : "transparent",
              color: activeTab === tab.id ? "var(--clr-primary-900, #1B5E20)" : "var(--clr-gray-600, #575752)",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OBSERVATION STATIONS VIEW ────────────────────────── */}
      {activeTab === "stations" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* Search, Filter & Sort Controls */}
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* Search Bar */}
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                placeholder="Search station, city or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px 28px 7px 10px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  fontSize: "12px",
                  outline: "none",
                  backgroundColor: "#ffffff",
                  color: "#0F172A",
                  boxSizing: "border-box",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#94A3B8",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Risk filter pills */}
            <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "2px" }}>
              {(["ALL", "RED", "ORANGE", "YELLOW", "GREEN"] as const).map((lvl) => {
                const isSelected = riskFilter === lvl;
                const count = riskCounts[lvl];
                return (
                  <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    style={{
                      padding: "3px 8px",
                      borderRadius: "9999px",
                      fontSize: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: isSelected ? "1px solid var(--clr-primary-800, #2E7D32)" : "1px solid var(--clr-gray-200, #E8E8E4)",
                      backgroundColor: isSelected ? "var(--clr-primary-800, #2E7D32)" : "#ffffff",
                      color: isSelected ? "#ffffff" : "var(--clr-gray-600, #575752)",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{lvl}</span>
                    <span
                      style={{
                        fontSize: "9px",
                        padding: "0 4px",
                        borderRadius: "9999px",
                        backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "var(--clr-gray-100, #F4F4F2)",
                        color: isSelected ? "#ffffff" : "var(--clr-gray-700, #3E3E38)",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--clr-gray-500, #737370)" }}>
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  fontSize: "11px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid var(--clr-gray-200, #E8E8E4)",
                  backgroundColor: "#ffffff",
                  color: "var(--clr-gray-900, #1E1E1B)",
                  outline: "none",
                }}
              >
                <option value="risk">Severity Alert Level</option>
                <option value="cape">Instability (Highest CAPE)</option>
                <option value="rain">Precipitation Rate</option>
                <option value="temp">Highest Temperature</option>
              </select>
            </div>
          </div>

          {/* ── Selected Station Detailed Inspection Drawer ─────────── */}
          {selectedStation && (
            <div
              style={{
                margin: "10px 12px 0 12px",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "var(--clr-primary-50, #EDF7EE)",
                border: "1.5px solid var(--clr-primary-300, #A5D6A7)",
                boxShadow: "var(--shadow-card, 0 4px 12px rgba(46, 125, 50, 0.08))",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "16px" }}>{getWeatherIcon(selectedStation.weatherCode)}</span>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--clr-primary-900, #1B5E20)" }}>
                      {selectedStation.name}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--clr-gray-500, #737370)", marginTop: "1px" }}>
                    {selectedStation.state} · ID: {selectedStation.stationId} ({selectedStation.lat.toFixed(2)}°N, {selectedStation.lon.toFixed(2)}°E)
                  </div>
                </div>
                <button
                  onClick={() => onSelectStation(null as any)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--clr-gray-500, #737370)",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "14px",
                    padding: "2px 4px",
                  }}
                  title="Close Selection"
                >
                  ✕
                </button>
              </div>

              {/* IMD Advisory Level */}
              <div
                style={{
                  padding: "5px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  backgroundColor:
                    selectedStation.riskLevel === "RED"
                      ? "#FEE2E2"
                      : selectedStation.riskLevel === "ORANGE"
                      ? "#FFEDD5"
                      : selectedStation.riskLevel === "YELLOW"
                      ? "#FEF9C3"
                      : "#DCFCE7",
                  color:
                    selectedStation.riskLevel === "RED"
                      ? "#991B1B"
                      : selectedStation.riskLevel === "ORANGE"
                      ? "#9A3412"
                      : selectedStation.riskLevel === "YELLOW"
                      ? "#854D0E"
                      : "#166534",
                }}
              >
                <span>IMD Risk: {selectedStation.riskLabel}</span>
                <span style={{ fontSize: "10px", textTransform: "uppercase" }}>{selectedStation.riskLevel}</span>
              </div>

              {/* Sounding & Telemetry Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px" }}>
                <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--clr-primary-200, #C8E6C9)" }}>
                  <span style={{ fontSize: "9px", color: "var(--clr-gray-500, #737370)", display: "block", fontWeight: 600 }}>INSTABILITY (CAPE)</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: selectedStation.cape >= 1500 ? "#DC2626" : "var(--clr-primary-800, #2E7D32)" }}>
                    {selectedStation.cape} J/kg
                  </span>
                  <span style={{ fontSize: "9px", color: "var(--clr-gray-400, #9E9E98)", display: "block" }}>LI: {selectedStation.liftedIndex}°C</span>
                </div>

                <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--clr-primary-200, #C8E6C9)" }}>
                  <span style={{ fontSize: "9px", color: "var(--clr-gray-500, #737370)", display: "block", fontWeight: 600 }}>SURFACE WIND</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)" }}>
                    {selectedStation.windSpeed} km/h
                  </span>
                  <span style={{ fontSize: "9px", color: "var(--clr-gray-400, #9E9E98)", display: "block" }}>Heading {selectedStation.windDirection}°</span>
                </div>

                <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--clr-primary-200, #C8E6C9)" }}>
                  <span style={{ fontSize: "9px", color: "var(--clr-gray-500, #737370)", display: "block", fontWeight: 600 }}>PRECIPITATION</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: selectedStation.precipitation > 0 ? "var(--clr-primary-800, #2E7D32)" : "var(--clr-gray-500, #737370)" }}>
                    {selectedStation.precipitation > 0 ? `${selectedStation.precipitation} mm/h` : "Nil"}
                  </span>
                  <span style={{ fontSize: "9px", color: "var(--clr-gray-400, #9E9E98)", display: "block" }}>Cloud: {selectedStation.cloudCover}%</span>
                </div>

                <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--clr-primary-200, #C8E6C9)" }}>
                  <span style={{ fontSize: "9px", color: "var(--clr-gray-500, #737370)", display: "block", fontWeight: 600 }}>AIR TEMP</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)" }}>
                    {selectedStation.temp}°C
                  </span>
                  <span style={{ fontSize: "9px", color: "var(--clr-gray-400, #9E9E98)", display: "block" }}>Humidity: {selectedStation.humidity}%</span>
                </div>
              </div>

              {/* Nearest Doppler Weather Radar (DWR) info */}
              {nearestRadarInfo && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid var(--clr-primary-200, #C8E6C9)",
                    fontSize: "10px",
                    color: "var(--clr-gray-700, #3E3E38)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>📡</span>
                    <strong>{nearestRadarInfo.radar.name}</strong> ({nearestRadarInfo.radar.band})
                  </span>
                  <span style={{ color: "var(--clr-primary-800, #2E7D32)", fontWeight: 700 }}>
                    {nearestRadarInfo.distanceKm} km away
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Station Cards List ──────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              backgroundColor: "#F8FAFC",
            }}
          >
            {filteredStations.map((st) => {
              const isSelected = selectedStation?.stationId === st.stationId;
              const badgeBg =
                st.riskLevel === "RED"
                  ? "#FEE2E2"
                  : st.riskLevel === "ORANGE"
                  ? "#FFEDD5"
                  : st.riskLevel === "YELLOW"
                  ? "#FEF9C3"
                  : "#DCFCE7";
              const badgeColor =
                st.riskLevel === "RED"
                  ? "#991B1B"
                  : st.riskLevel === "ORANGE"
                  ? "#9A3412"
                  : st.riskLevel === "YELLOW"
                  ? "#854D0E"
                  : "#166534";

              const capePercent = Math.min(100, Math.round((st.cape / 3000) * 100));

              return (
                <div
                  key={st.stationId}
                  onClick={() => onSelectStation(st)}
                  className="esam-card"
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    border: isSelected ? "1.5px solid var(--clr-primary-800, #2E7D32)" : "1px solid var(--clr-gray-200, #E8E8E4)",
                    backgroundColor: isSelected ? "var(--clr-primary-50, #EDF7EE)" : "#ffffff",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px" }}>{getWeatherIcon(st.weatherCode)}</span>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)" }}>
                          {st.name}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--clr-gray-500, #737370)", fontWeight: 500 }}>
                          {st.state}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "9px",
                        padding: "2px 7px",
                        borderRadius: "9999px",
                        fontWeight: 800,
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {st.riskLevel}
                    </span>
                  </div>

                  {/* Instability Indicator Bar */}
                  <div style={{ marginTop: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--clr-gray-500, #737370)", marginBottom: "2px" }}>
                      <span>Instability (CAPE)</span>
                      <strong style={{ color: st.cape >= 1500 ? "#DC2626" : st.cape >= 800 ? "#D97706" : "#16A34A" }}>
                        {st.cape} J/kg
                      </strong>
                    </div>
                    <div style={{ height: "4px", width: "100%", backgroundColor: "var(--clr-gray-100, #F4F4F2)", borderRadius: "9999px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${capePercent}%`,
                          backgroundColor: st.cape >= 1500 ? "#DC2626" : st.cape >= 800 ? "#EA580C" : "var(--clr-primary-700, #388E3C)",
                          borderRadius: "9999px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* 3-Parameter Metric Strip */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "4px",
                      marginTop: "8px",
                      paddingTop: "6px",
                      borderTop: "1px solid var(--clr-gray-100, #F4F4F2)",
                      fontSize: "10px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--clr-gray-400, #9E9E98)", display: "block" }}>TEMP</span>
                      <span style={{ fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)" }}>{st.temp}°C</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--clr-gray-400, #9E9E98)", display: "block" }}>WIND</span>
                      <span style={{ fontWeight: 700, color: "var(--clr-gray-900, #1E1E1B)" }}>{st.windSpeed} km/h</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--clr-gray-400, #9E9E98)", display: "block" }}>PRECIP</span>
                      <span style={{ fontWeight: 700, color: st.precipitation > 0 ? "var(--clr-primary-800, #2E7D32)" : "var(--clr-gray-500, #737370)" }}>
                        {st.precipitation > 0 ? `${st.precipitation} mm` : "Nil"}
                      </span>
                    </div>
                  </div>

                  {/* Weather description footer */}
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "10px",
                      color: "var(--clr-gray-500, #737370)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{getWeatherConditionName(st.weatherCode)}</span>
                    <span style={{ fontSize: "9px", color: "var(--clr-primary-800, #2E7D32)", fontWeight: 700 }}>
                      Inspect →
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredStations.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", fontSize: "12px", color: "#94A3B8" }}>
                No weather stations match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: ATMOSPHERIC CONDITIONS ──────────────────────────── */}
      {activeTab === "atmosphere" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#F8FAFC" }}>
          {/* Section Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#090D16", textTransform: "uppercase" }}>
              Atmospheric Conditions
            </span>
            <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "9999px", backgroundColor: "#FEF3C7", color: "#B45309", fontWeight: 800 }}>
              Demo / Simulated Data
            </span>
          </div>

          {/* Explanation Box: "Why is a storm likely?" */}
          <div
            style={{
              backgroundColor: "#FFFBEB",
              border: "1px solid #FCD34D",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "11px",
            }}
          >
            <div style={{ fontWeight: 800, color: "#92400E", display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
              <span>⚠️</span>
              <span>Why is a storm likely?</span>
            </div>
            <p style={{ color: "#78350F", margin: 0, lineHeight: 1.5 }}>
              High atmospheric instability (CAPE &gt; 2,100 J/kg), increasing moisture (RH 79%) and strong 0–6km vertical wind shear (19.5 m/s) indicate favorable conditions for deep convective thunderstorm development, squalls and lightning activity.
            </p>
          </div>

          {/* 9 Atmospheric Parameters Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {CURRENT_ATMOSPHERIC_CONDITIONS.map((param) => {
              const isSevere = param.status === "severe";
              const isElevated = param.status === "elevated";
              const valColor = isSevere ? "#DC2626" : isElevated ? "#D97706" : "#0F172A";

              return (
                <div
                  key={param.id}
                  className="esam-card"
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "#FFFFFF",
                    border: isSevere ? "1px solid #FECACA" : "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>{param.name}</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "2px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 800, color: valColor }}>{param.value}</span>
                        <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 600 }}>{param.unit}</span>
                      </div>
                    </div>

                    {/* Trend Indicator */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "9999px",
                        backgroundColor: param.trend === "rising" ? "#FEE2E2" : param.trend === "falling" ? "#EFF6FF" : "#F1F5F9",
                        color: param.trend === "rising" ? "#B91C1C" : param.trend === "falling" ? "#1D4ED8" : "#475569",
                      }}
                    >
                      <span>{param.trend === "rising" ? "↑" : param.trend === "falling" ? "↓" : "→"}</span>
                      <span>{param.trendText}</span>
                    </div>
                  </div>

                    {/* Simple Visual Indicator Bar */}
                  <div style={{ marginTop: "6px" }}>
                    <div style={{ height: "4px", width: "100%", backgroundColor: "var(--clr-gray-100, #F4F4F2)", borderRadius: "9999px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${param.percent}%`,
                          backgroundColor: isSevere ? "#DC2626" : isElevated ? "#EA580C" : "var(--clr-primary-800, #2E7D32)",
                          borderRadius: "9999px",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: "9px", color: "var(--clr-gray-500, #737370)", marginTop: "4px", lineHeight: 1.4 }}>
                    {param.description}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: "9px", color: "var(--clr-gray-400, #9E9E98)", textAlign: "center", padding: "4px 0" }}>
            * Real-time surface parameters synchronized with IMD AWS. Upper sounding and cloud-top telemetry operating on demo assimilation feed.
          </div>
        </div>
      )}

      {/* ── TAB 3: OBSERVATION & DATA SOURCES ──────────────────────── */}
      {activeTab === "sources" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#F8FAFC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)", textTransform: "uppercase" }}>
              Major Observation Sources
            </span>
            <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "9999px", backgroundColor: "var(--clr-primary-50, #EDF7EE)", color: "var(--clr-primary-900, #1B5E20)", fontWeight: 700, border: "1px solid var(--clr-primary-200, #C8E6C9)" }}>
              5 Ingestion Feeds
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {OBSERVATION_DATA_SOURCES.map((src) => (
              <div
                key={src.id}
                className="esam-card"
                style={{
                  padding: "12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--clr-primary-200, #C8E6C9)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)" }}>
                    {src.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: src.statusColor, display: "inline-block" }}></span>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: src.statusColor }}>
                      {src.status}
                    </span>
                    {src.isDemo && (
                      <span style={{ fontSize: "8px", padding: "1px 5px", borderRadius: "9999px", backgroundColor: "#FEF3C7", color: "#92400E", fontWeight: 800, border: "1px solid #FDE68A" }}>
                        DEMO
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: "10px", color: "var(--clr-primary-800, #2E7D32)", fontWeight: 600, marginBottom: "6px" }}>
                  {src.sourceAuthority}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "10px", color: "var(--clr-gray-600, #575752)", borderTop: "1px solid var(--clr-primary-100, #E8F5E9)", paddingTop: "6px" }}>
                  <div>
                    <span style={{ color: "var(--clr-gray-400, #9E9E98)" }}>Data Type: </span>
                    <strong style={{ color: "var(--clr-gray-900, #1E1E1B)" }}>{src.dataType}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--clr-gray-400, #9E9E98)" }}>Coverage: </span>
                    <span>{src.coverage}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px", color: "var(--clr-gray-500, #737370)", fontSize: "9px" }}>
                    <span>Last Updated: {src.lastUpdated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "var(--clr-primary-50, #EDF7EE)", border: "1px solid var(--clr-primary-200, #C8E6C9)", borderRadius: "8px", padding: "8px 10px", fontSize: "10px", color: "var(--clr-gray-700, #3E3E38)", lineHeight: 1.4 }}>
            💡 <strong>Observation Architecture:</strong> Cross-attention neural nowcasting blends real-time radar Doppler scans with satellite infrared and surface AWS soundings every 10 minutes.
          </div>
        </div>
      )}

      {/* ── TAB 4: IMD DOPPLER WEATHER RADARS (DWR) ─────────────────── */}
      {activeTab === "radars" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#F8FAFC" }}>
          <div style={{ fontSize: "11px", color: "var(--clr-gray-500, #737370)", marginBottom: "4px" }}>
            Operational IMD Doppler Weather Radar Network (S, C, X-Band).
          </div>
          {IMD_DWR_NETWORK.map((dwr) => (
            <div key={dwr.name} className="esam-card" style={{ padding: "12px", border: "1px solid var(--clr-primary-200, #C8E6C9)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)" }}>{dwr.name}</span>
                <span
                  style={{
                    fontSize: "9px",
                    padding: "2px 7px",
                    borderRadius: "9999px",
                    backgroundColor: "var(--clr-primary-50, #EDF7EE)",
                    color: "var(--clr-primary-900, #1B5E20)",
                    fontWeight: 700,
                    border: "1px solid var(--clr-primary-200, #C8E6C9)",
                  }}
                >
                  {dwr.status}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--clr-gray-500, #737370)", marginTop: "2px" }}>
                {dwr.city}, {dwr.state}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid var(--clr-primary-100, #E8F5E9)",
                  fontSize: "11px",
                  color: "var(--clr-gray-600, #575752)",
                }}
              >
                <span>Band: <strong style={{ color: "var(--clr-primary-800, #2E7D32)" }}>{dwr.band}</strong></span>
                <span>Radius: <strong>{dwr.rangeKm} km</strong></span>
                <span style={{ fontFamily: "monospace", color: "var(--clr-gray-400, #9E9E98)", fontSize: "10px" }}>
                  {dwr.lat.toFixed(1)}°N, {dwr.lon.toFixed(1)}°E
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 5: LAYERS TOGGLE ───────────────────────────────────── */}
      {activeTab === "layers" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#F8FAFC" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)", textTransform: "uppercase" }}>
            Map Layer Toggles
          </div>

          {[
            { id: "riskZones", label: "AI Thunderstorm Risk Layer (Zones)", desc: "Zonal convective threat assessment (Severe, High, Moderate, Low)" },
            { id: "radar", label: "Doppler Radar Reflectivity (dBZ)", desc: "IMD 3D composite radar scan" },
            { id: "satellite", label: "INSAT-3D Satellite Cloud Imagery", desc: "TIR-1 Brightness temperature" },
            { id: "lightning", label: "Ground Lightning Sensor Telemetry", desc: "IITM Damini real-time strikes" },
            { id: "radarRings", label: "DWR Radar Coverage Rings", desc: "150km & 250km surveillance cones" },
          ].map((layer) => {
            const isActive = activeLayers[layer.id] ?? false;
            return (
              <label
                key={layer.id}
                className="esam-card"
                style={{
                  padding: "12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  cursor: "pointer",
                  border: isActive ? "1.5px solid var(--clr-primary-800, #2E7D32)" : "1px solid var(--clr-primary-200, #C8E6C9)",
                  backgroundColor: isActive ? "var(--clr-primary-50, #EDF7EE)" : "#ffffff",
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => onToggleLayer(layer.id)}
                  style={{ marginTop: "2px", cursor: "pointer", accentColor: "var(--clr-primary-800, #2E7D32)" }}
                />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--clr-gray-900, #1E1E1B)" }}>{layer.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--clr-gray-500, #737370)", marginTop: "2px" }}>{layer.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </aside>
  );
}
