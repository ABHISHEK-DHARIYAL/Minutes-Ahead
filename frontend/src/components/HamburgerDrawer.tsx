"use client";
import Image from "next/image";
import { IMD_DWR_NETWORK } from "@/data/indiaData";

interface HamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "hi";
  onLangChange: (l: "en" | "hi") => void;
  currentTab: "home" | "dashboard" | "about";
  onTabChange: (tab: "home" | "dashboard" | "about") => void;
  muted: boolean;
  onMuteToggle: () => void;
}

export default function HamburgerDrawer({
  isOpen,
  onClose,
  lang,
  onLangChange,
  currentTab,
  onTabChange,
  muted,
  onMuteToggle,
}: HamburgerDrawerProps) {
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "-6px 0 32px rgba(15,23,42,0.2)",
          display: "flex",
          flexDirection: "column",
          zIndex: 10000,
          borderLeft: "1px solid #E2E8F0",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#F8FAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Image
              src="/logo.png"
              alt="Minutes Ahead Logo"
              width={38}
              height={38}
              style={{ borderRadius: "50%", border: "1.5px solid #C8E6C9" }}
            />
            <div>
              <div style={{ fontWeight: 800, color: "#1B5E20", fontSize: "16px" }}>
                Minutes Ahead
              </div>
              <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 500 }}>
                {lang === "hi" ? "मेन्यू एवं संसाधन पोर्टल" : "Menu & Meteorological Resources"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              border: "1px solid #CBD5E1",
              color: "#64748B",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* 1. Language Selection (Hindi / English ONLY) */}
          <div
            style={{
              padding: "14px",
              backgroundColor: "#EDF7EE",
              border: "1.5px solid #C8E6C9",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#1B5E20",
                textTransform: "uppercase",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>🌐 {lang === "hi" ? "भाषा का चयन (Language)" : "Language Selection"}</span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "1px 6px",
                  backgroundColor: "#ffffff",
                  color: "#2E7D32",
                  borderRadius: "4px",
                  border: "1px solid #C8E6C9",
                }}
              >
                {lang === "hi" ? "हिन्दी" : "English"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                onClick={() => onLangChange("en")}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: lang === "en" ? "1.5px solid #2E7D32" : "1px solid #CBD5E1",
                  backgroundColor: lang === "en" ? "#2E7D32" : "#ffffff",
                  color: lang === "en" ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease",
                }}
              >
                English
              </button>
              <button
                onClick={() => onLangChange("hi")}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: lang === "hi" ? "1.5px solid #2E7D32" : "1px solid #CBD5E1",
                  backgroundColor: lang === "hi" ? "#2E7D32" : "#ffffff",
                  color: lang === "hi" ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease",
                }}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          {/* 2. Page Navigation Links */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>
              {lang === "hi" ? "पोर्टल अनुभाग" : "Navigation Links"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { id: "home", label: lang === "hi" ? "मुख्य पृष्ठ (Home)" : "Home Portal", icon: "🏠" },
                { id: "dashboard", label: lang === "hi" ? "मैप डैशबोर्ड (Map Dashboard)" : "Live Map Dashboard", icon: "🗺️" },
                { id: "about", label: lang === "hi" ? "हमारे बारे में (About Mission)" : "About Project & Mission", icon: "ℹ️" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id as any);
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    border: currentTab === item.id ? "1.5px solid #2E7D32" : "1px solid #E2E8F0",
                    backgroundColor: currentTab === item.id ? "#2E7D32" : "#ffffff",
                    color: currentTab === item.id ? "#ffffff" : "#0F172A",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <span>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Audio Alarm Toggle */}
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "#ffffff",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>
                {lang === "hi" ? "वज्रपात चेतावनी ध्वनि" : "Lightning Audio Alert"}
              </div>
              <div style={{ fontSize: "11px", color: "#64748B" }}>
                {muted
                  ? lang === "hi" ? "अलर्ट म्यूट है" : "Alert chime is muted"
                  : lang === "hi" ? "ध्वनि सक्रिय है" : "Sound is active on strikes"}
              </div>
            </div>
            <button
              onClick={onMuteToggle}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                border: muted ? "1px solid #CBD5E1" : "1.5px solid #C8E6C9",
                backgroundColor: muted ? "#F1F5F9" : "#EDF7EE",
                color: muted ? "#64748B" : "#1B5E20",
              }}
            >
              {muted ? "🔇 Unmute" : "🔔 Mute"}
            </button>
          </div>

          {/* 4. IMD Doppler Radar Network Quick Summary */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
              <span>📡 {lang === "hi" ? "IMD डॉपलर रडार नेटवर्क" : "IMD Radar Network"}</span>
              <span style={{ color: "#15803D", fontWeight: 700 }}>17 Active</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
              {IMD_DWR_NETWORK.slice(0, 8).map((dwr) => (
                <div
                  key={dwr.name}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    fontSize: "11px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#0F172A" }}>{dwr.name}</span>
                  <span style={{ color: "#64748B", fontFamily: "monospace" }}>{dwr.band} · {dwr.rangeKm}km</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Emergency Helplines */}
          <div
            style={{
              padding: "14px",
              backgroundColor: "#FFF1F2",
              border: "1px solid #FECDD3",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#881337", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🚨</span>
              <span>{lang === "hi" ? "आपदा हेल्पलाइन" : "Disaster Helplines"}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px", color: "#9F1239" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>NDMA Helpline:</span>
                <strong style={{ fontFamily: "monospace", fontSize: "13px" }}>1078</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>National Emergency:</span>
                <strong style={{ fontFamily: "monospace", fontSize: "13px" }}>112</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={{ padding: "14px", borderTop: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", textAlign: "center", fontSize: "11px", color: "#64748B" }}>
          Minutes Ahead · Ministry of Earth Sciences / IMD
        </div>
      </div>
    </div>
  );
}
