"use client";
import { useState } from "react";
import type { StormCard, NowcastData } from "@/app/page";

interface RightPanelProps {
  nowcast: NowcastData | null;
  selectedStorm: StormCard | null;
  onSelect: (s: StormCard | null) => void;
  lang: "en" | "hi";
  appMode: "public" | "forecaster";
  mlApiUrl: string;
}

export default function RightPanel({
  nowcast,
  selectedStorm,
  onSelect,
  lang,
  appMode,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<"storms" | "advisory" | "forecaster">("storms");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const storms = nowcast?.storm_cards ?? [];

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
        title="Open Early Warning Panel"
      >
        <span>◀</span>
        <span>⚡ Storm Alerts ({storms.length})</span>
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
      {/* Header */}
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
            Early Warning Center
          </span>
          <span
            style={{
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "9999px",
              backgroundColor: "#FEE2E2",
              color: "#B91C1C",
              fontWeight: 800,
              border: "1px solid #FECACA",
            }}
          >
            {storms.length} ACTIVE CELLS
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
          ▶
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", backgroundColor: "#ffffff" }}>
        {[
          { id: "storms", label: `Storms (${storms.length})` },
          { id: "advisory", label: "Safety Rules" },
          ...(appMode === "forecaster" ? [{ id: "forecaster", label: "Verification" }] : []),
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

      {/* Tab 1: Convective Storm Cells & Warnings */}
      {activeTab === "storms" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#F8FAFC" }}>
          {storms.map((storm) => {
            const isSelected = selectedStorm?.id === storm.id;
            const badgeClass =
              storm.severity === "EXTREME"
                ? "badge-red"
                : storm.severity === "SEVERE"
                ? "badge-orange"
                : "badge-yellow";

            return (
              <div
                key={storm.id}
                onClick={() => onSelect(isSelected ? null : storm)}
                className="esam-card"
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  border: isSelected ? "1.5px solid #2E7D32" : "1px solid #E2E8F0",
                  backgroundColor: isSelected ? "#F0FDF4" : "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 800, color: "#0F2744" }}>
                    {storm.id}
                  </span>
                  <span className={badgeClass} style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "9999px", fontWeight: 800, textTransform: "uppercase" }}>
                    IMD {storm.severity}
                  </span>
                </div>

                <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>
                  📍 {storm.nearest_district ?? "Indian District"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #F1F5F9", fontSize: "11px" }}>
                  <div>
                    <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", fontWeight: 600 }}>REFLECTIVITY</span>
                    <span style={{ fontWeight: 800, color: "#0F172A" }}>
                      {storm.max_reflectivity.toFixed(0)} dBZ
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", fontWeight: 600 }}>SPEED</span>
                    <span style={{ fontWeight: 700, color: "#0F172A" }}>
                      {storm.speed_kmh.toFixed(0)} km/h
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "9px", color: "#94A3B8", display: "block", fontWeight: 600 }}>IMPACT ETA</span>
                    <span style={{ fontWeight: 800, color: "#C2410C" }}>
                      {storm.eta_minutes ? `~${Math.round(storm.eta_minutes)}m` : "Imminent"}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "8px", fontSize: "10px", color: "#64748B", display: "flex", justifyContent: "space-between", fontWeight: 500 }}>
                  <span>Coverage: {Math.round(storm.area_km2)} km²</span>
                  <span>Confidence: {(storm.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            );
          })}

          {storms.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0", fontSize: "12px", color: "#94A3B8" }}>
              No severe convective storm cells detected in current surveillance scan.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Safety Advisory */}
      {activeTab === "advisory" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#F8FAFC", fontSize: "12px" }}>
          {/* 30-30 Rule */}
          <div className="esam-card" style={{ padding: "14px", border: "1.5px solid #FCD34D", backgroundColor: "#FFFBEB" }}>
            <div style={{ fontWeight: 800, color: "#78350F", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <span>⚡</span>
              <span>{lang === "hi" ? "30-30 का सुरक्षा नियम" : "The 30-30 Lightning Rule"}</span>
            </div>
            <p style={{ fontSize: "11px", lineHeight: 1.6, color: "#92400E", margin: 0 }}>
              {lang === "hi"
                ? "बिजली चमकने और गड़गड़ाहट के बीच यदि 30 सेकंड से कम समय हो, तो तुरंत पक्के मकान में शरण लें। अंतिम गड़गड़ाहट के बाद 30 मिनट तक बाहर न निकलें।"
                : "If the time between lightning flash and thunder is less than 30 seconds, seek immediate enclosed shelter. Wait 30 minutes after the last thunder before heading outdoors."}
            </p>
          </div>

          {/* Farmer Advisory */}
          <div className="esam-card" style={{ padding: "14px", border: "1.5px solid #BBF7D0", backgroundColor: "#F0FDF4" }}>
            <div style={{ fontWeight: 800, color: "#166534", marginBottom: "6px" }}>
              🌾 {lang === "hi" ? "किसानों और ग्रामीण क्षेत्रों के लिए सलाह" : "Advisory for Farmers & Field Workers"}
            </div>
            <ul style={{ fontSize: "11px", lineHeight: 1.6, color: "#14532D", paddingLeft: "16px", margin: 0 }}>
              <li>
                {lang === "hi"
                  ? "खेतों में काम तुरंत बंद करें और ऊंचे पेड़ों या खंभों के नीचे शरण न लें।"
                  : "Stop agricultural operations immediately. Do not take shelter under solitary tall trees or metal poles."}
              </li>
              <li>
                {lang === "hi"
                  ? "ट्रैक्टर, हल और धातु के औजारों से कम से कम 50 मीटर दूर रहें।"
                  : "Stay clear of tractors, power tillers, and metal agricultural equipment."}
              </li>
              <li>
                {lang === "hi"
                  ? "पशुओं को खुले खेतों और तालाबों से हटाकर पक्के बाड़े में रखें।"
                  : "Move livestock away from water bodies and open pastures into secure shelters."}
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Forecaster Verification Telemetry */}
      {activeTab === "forecaster" && appMode === "forecaster" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#F8FAFC", fontSize: "12px" }}>
          <div className="esam-card" style={{ padding: "14px" }}>
            <div style={{ fontWeight: 800, color: "#0F2744", marginBottom: "8px" }}>Model Verification (Test Set)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>CSI (Critical Success Index @ 35 dBZ):</span>
                <strong style={{ color: "#15803D" }}>0.42</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>POD (Probability of Detection):</span>
                <strong style={{ color: "#15803D" }}>0.76</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>FAR (False Alarm Ratio):</span>
                <strong style={{ color: "#B91C1C" }}>0.31</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>HSS (Heidke Skill Score):</span>
                <strong style={{ color: "#2563EB" }}>0.45</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
