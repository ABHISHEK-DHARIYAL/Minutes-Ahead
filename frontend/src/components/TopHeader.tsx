"use client";
import { useEffect, useState, useRef } from "react";

interface TopHeaderProps {
  currentTab: "home" | "nowcast" | "safety" | "about";
  onTabChange: (tab: "home" | "nowcast" | "safety" | "about") => void;
  onOpenMenu: () => void;
  lang: "en" | "hi";
  onLangChange: (lang: "en" | "hi") => void;
}

export default function TopHeader({
  currentTab,
  onTabChange,
  onOpenMenu,
  lang,
  onLangChange,
}: TopHeaderProps) {
  const [istTime, setIstTime] = useState("");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTime(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
    }
    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangOpen]);

  return (
    <header style={{ width: "100%", flexShrink: 0, zIndex: 100, userSelect: "none" }}>
      {/* ── Row 1: Deep Evergreen Brand Header (Photo 3 Style) ────── */}
      <div className="brand-header">
        {/* Left: Brand Identity (Photo 2: Logo + Minutes Ahead, no subtitle, no govt badge) */}
        <div className="brand-left" onClick={() => onTabChange("home")}>
          <div className="brand-logo-frame" style={{ borderRadius: "50%", border: "none", background: "#FFFFFF", overflow: "hidden" }}>
            <img
              src="logo.png"
              alt="Minutes Ahead Logo"
              width={42}
              height={42}
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%", clipPath: "circle(49% at 50% 50%)" }}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes("/logo.png")) {
                  target.src = "/logo.png";
                }
              }}
            />
          </div>
          <div className="brand-titles">
            <span className="brand-title" style={{ color: "#111827", fontWeight: 800 }}>Minutes Ahead</span>
          </div>

          <span className="brand-divider hidden sm:block" aria-hidden="true" />

          {/* Digital India Emblem with clean white background container */}
          <div className="digital-india-container hidden sm:flex items-center">
            <img
              src="digital-india.png"
              alt="Digital India - Power To Empower"
              width={112}
              height={32}
              style={{ height: "30px", width: "auto", objectFit: "contain" }}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes("/digital-india.png")) {
                  target.src = "/digital-india.png";
                }
              }}
            />
          </div>
        </div>

        {/* Right: Photo 1 Style Language Dropdown Pill + Menu Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Photo 1: Capsule Pill Language Switcher with Dropdown Chevron */}
          <div ref={langDropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setIsLangOpen((prev) => !prev)}
              className="lang-pill-btn"
              title="Change Language / भाषा बदलें"
              aria-label="Select Language"
              aria-expanded={isLangOpen}
            >
              <span>{lang === "hi" ? "हिन्दी" : "English"}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isLangOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.18s ease",
                  color: "#4B5563",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Language Selection Popup Menu */}
            {isLangOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.18)",
                  minWidth: "128px",
                  zIndex: 1000,
                  padding: "4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  animation: "fadeIn 0.15s ease-out",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onLangChange("en");
                    setIsLangOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 12px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: lang === "en" ? "#EDF7EE" : "transparent",
                    color: lang === "en" ? "#1B5E20" : "#374151",
                    fontWeight: lang === "en" ? 700 : 500,
                    fontSize: "12.5px",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "background 0.15s ease",
                  }}
                >
                  <span>English</span>
                  {lang === "en" && <span style={{ color: "#2E7D32", fontWeight: 800 }}>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLangChange("hi");
                    setIsLangOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 12px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: lang === "hi" ? "#EDF7EE" : "transparent",
                    color: lang === "hi" ? "#1B5E20" : "#374151",
                    fontWeight: lang === "hi" ? 700 : 500,
                    fontSize: "12.5px",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "background 0.15s ease",
                  }}
                >
                  <span>हिन्दी</span>
                  {lang === "hi" && <span style={{ color: "#2E7D32", fontWeight: 800 }}>✓</span>}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenMenu}
            className="hamburger-btn"
            title="Menu & All Services"
            aria-label="Menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
            <span>{lang === "hi" ? "मेन्यू" : "MENU"}</span>
          </button>
        </div>
      </div>

      {/* ── National Tricolor Accent Strip (e-Samanvit Signature) ──── */}
      <div className="tricolor-bar" />

      {/* ── Row 2: Main Navigation Bar (Centered) ─────────────────── */}
      <div className="main-navbar">
        {/* Left Slot: Live Synoptic Telemetry Badge */}
        <div className="nav-left-slot">
          <div className="live-status-pill">
            <span className="live-pulse-dot" />
            <span>
              {lang === "hi"
                ? "राष्ट्रीय तात्कालिक मौसम वेधशाला"
                : "IMD Synoptic & Doppler Telemetry"}
            </span>
          </div>
        </div>

        {/* Center Slot: Navigation Tabs (Middle Aligned) */}
        <div className="nav-center-slot">
          <nav className="nav-tabs-pill-container" role="tablist" aria-label="Main Navigation">
            <button
              role="tab"
              aria-selected={currentTab === "home"}
              onClick={() => onTabChange("home")}
              className={`nav-tab-btn ${currentTab === "home" ? "active" : ""}`}
              title="Home Portal"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{lang === "hi" ? "मुख्य पृष्ठ" : "Home"}</span>
            </button>

            <button
              role="tab"
              aria-selected={currentTab === "nowcast"}
              onClick={() => onTabChange("nowcast")}
              className={`nav-tab-btn ${currentTab === "nowcast" ? "active" : ""}`}
              title="Live Weather & Convective Nowcast Map"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              <span>{lang === "hi" ? "नाउकास्ट" : "Nowcast"}</span>
              <span className="nav-tab-badge">LIVE</span>
            </button>

            <button
              role="tab"
              aria-selected={currentTab === "safety"}
              onClick={() => onTabChange("safety")}
              className={`nav-tab-btn ${currentTab === "safety" ? "active" : ""}`}
              title="National Public Thunderstorm & Lightning Safety Protocol"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>{lang === "hi" ? "सुरक्षा" : "Safety"}</span>
            </button>

            <button
              role="tab"
              aria-selected={currentTab === "about"}
              onClick={() => onTabChange("about")}
              className={`nav-tab-btn ${currentTab === "about" ? "active" : ""}`}
              title="About the Mission"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>{lang === "hi" ? "हमारे बारे में" : "About Us"}</span>
            </button>
          </nav>
        </div>

        {/* Right Slot: Live IST Clock */}
        <div className="nav-right-slot">
          <div className="nav-right-clock">
            <span className="clock-dot" />
            <span className="clock-label">IST</span>
            <span className="clock-time">{istTime || "--:--:--"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
