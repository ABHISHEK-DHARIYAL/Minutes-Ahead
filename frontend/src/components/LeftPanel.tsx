"use client";
import { useState, useMemo } from "react";
import { LiveWeatherData, getWeatherConditionName, IMD_DWR_NETWORK } from "@/data/indiaData";

interface LeftPanelProps {
  weatherData: LiveWeatherData[];
  onSelectStation: (st: LiveWeatherData) => void;
  selectedStation: LiveWeatherData | null;
  activeLayers: Record<string, boolean>;
  onToggleLayer: (layerId: string) => void;
}

export default function LeftPanel({
  weatherData,
  onSelectStation,
  selectedStation,
  activeLayers,
  onToggleLayer,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<"stations" | "radars" | "layers">("stations");
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "RED" | "ORANGE" | "YELLOW" | "GREEN">("ALL");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filtered stations
  const filteredStations = useMemo(() => {
    return weatherData.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === "ALL" || s.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [weatherData, searchQuery, riskFilter]);

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        style={{
          padding: "10px 14px",
          backgroundColor: "#ffffff",
          border: "1.5px solid #C8E6C9",
          borderRadius: "10px",
          fontSize: "12px",
          fontWeight: 700,
          color: "#1B5E20",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(46,125,50,0.12)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        title="Open Observatory Panel"
      >
        <span>📍 Stations & Radars</span>
        <span>▶</span>
      </button>
    );
  }

  return (
    <aside
      style={{
        width: "320px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(12px)",
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Header & Tabs */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#F8FAFC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#1B5E20", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Observatory Stations
          </span>
          <span
            style={{
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "9999px",
              backgroundColor: "#E8F5E9",
              color: "#2E7D32",
              fontWeight: 700,
              border: "1px solid #C8E6C9",
            }}
          >
            INDIA (30+)
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "#64748B",
            fontSize: "12px",
            cursor: "pointer",
            padding: "4px",
          }}
          title="Collapse Panel"
        >
          ◀
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}>
        {[
          { id: "stations", label: `Stations (${filteredStations.length})` },
          { id: "radars", label: `DWR Radars (${IMD_DWR_NETWORK.length})` },
          { id: "layers", label: "Layers" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: "10px 4px",
              textAlign: "center",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === tab.id ? "2.5px solid #2E7D32" : "2.5px solid transparent",
              backgroundColor: activeTab === tab.id ? "#F0FDF4" : "transparent",
              color: activeTab === tab.id ? "#1B5E20" : "#64748B",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Live Indian Weather Stations */}
      {activeTab === "stations" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* Search & Filter */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", display: "flex", flexDirection: "column", gap: "8px" }}>
            <input
              type="text"
              placeholder="Search city, district, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                outline: "none",
                backgroundColor: "#ffffff",
                color: "#0F172A",
              }}
            />
            {/* Risk filter pills */}
            <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingTop: "2px" }}>
              {(["ALL", "RED", "ORANGE", "YELLOW", "GREEN"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setRiskFilter(lvl)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: riskFilter === lvl ? "1px solid #2E7D32" : "1px solid #CBD5E1",
                    backgroundColor: riskFilter === lvl ? "#2E7D32" : "#ffffff",
                    color: riskFilter === lvl ? "#ffffff" : "#64748B",
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Station Cards List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#F8FAFC" }}>
            {filteredStations.map((st) => {
              const isSelected = selectedStation?.stationId === st.stationId;
              const badgeClass =
                st.riskLevel === "RED"
                  ? "badge-red"
                  : st.riskLevel === "ORANGE"
                  ? "badge-orange"
                  : st.riskLevel === "YELLOW"
                  ? "badge-yellow"
                  : "badge-green";

              return (
                <div
                  key={st.stationId}
                  onClick={() => onSelectStation(st)}
                  className="esam-card"
                  style={{
                    padding: "12px",
                    cursor: "pointer",
                    border: isSelected ? "1.5px solid #2E7D32" : "1px solid #E2E8F0",
                    backgroundColor: isSelected ? "#F0FDF4" : "#ffffff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A" }}>
                        {st.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 500 }}>{st.state}</div>
                    </div>
                    <span className={badgeClass} style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "9999px", fontWeight: 800, textTransform: "uppercase" }}>
                      {st.riskLevel}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #F1F5F9", fontSize: "11px" }}>
                    <div>
                      <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", fontWeight: 600 }}>TEMP</span>
                      <span style={{ fontWeight: 800, color: "#0F172A" }}>{st.temp}°C</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", fontWeight: 600 }}>CAPE</span>
                      <span
                        style={{
                          fontWeight: 800,
                          color: st.cape >= 1500 ? "#B91C1C" : st.cape >= 800 ? "#B45309" : "#15803D",
                        }}
                      >
                        {st.cape} J/kg
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", fontWeight: 600 }}>WIND</span>
                      <span style={{ fontWeight: 700, color: "#0F172A" }}>{st.windSpeed} km/h</span>
                    </div>
                  </div>

                  <div style={{ marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10px", color: "#64748B" }}>
                    <span>{getWeatherConditionName(st.weatherCode)}</span>
                    {st.precipitation > 0 && (
                      <span style={{ color: "#2563EB", fontWeight: 700 }}>🌧️ {st.precipitation} mm/h</span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredStations.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", fontSize: "12px", color: "#94A3B8" }}>
                No stations match the search filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: IMD Doppler Weather Radar Network */}
      {activeTab === "radars" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#F8FAFC" }}>
          <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "4px" }}>
            Operational IMD Doppler Weather Radars (S, C, X-Band).
          </div>
          {IMD_DWR_NETWORK.map((dwr) => (
            <div key={dwr.name} className="esam-card" style={{ padding: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A" }}>{dwr.name}</span>
                <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "9999px", backgroundColor: "#DCFCE7", color: "#15803D", fontWeight: 700 }}>
                  {dwr.status}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                {dwr.city}, {dwr.state}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #F1F5F9", fontSize: "11px", color: "#475569" }}>
                <span>Band: <strong style={{ color: "#0284C7" }}>{dwr.band}</strong></span>
                <span>Radius: <strong>{dwr.rangeKm} km</strong></span>
                <span style={{ fontFamily: "monospace", color: "#94A3B8", fontSize: "10px" }}>
                  {dwr.lat.toFixed(1)}°N, {dwr.lon.toFixed(1)}°E
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Layers */}
      {activeTab === "layers" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#F8FAFC" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#1B5E20", textTransform: "uppercase" }}>
            Map Layer Toggles
          </div>

          {[
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
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => onToggleLayer(layer.id)}
                  style={{ marginTop: "2px", cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>{layer.label}</div>
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{layer.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </aside>
  );
}
