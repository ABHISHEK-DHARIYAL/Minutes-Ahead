"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface TopHeaderProps {
  currentTab: "home" | "dashboard" | "about";
  onTabChange: (tab: "home" | "dashboard" | "about") => void;
  onOpenMenu: () => void;
  lang: "en" | "hi";
}

export default function TopHeader({
  currentTab,
  onTabChange,
  onOpenMenu,
  lang,
}: TopHeaderProps) {
  const [istTime, setIstTime] = useState("");

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

  return (
    <header style={{ width: "100%", flexShrink: 0, zIndex: 100, userSelect: "none" }}>
      {/* ── Row 1: Brand Header ───────────────────────────────────── */}
      <div className="brand-header">
        {/* Left: Brand Identity & Digital India Logo */}
        <div className="brand-left" onClick={() => onTabChange("home")}>
          <div className="brand-logo-frame">
            <Image
              src="/logo.png"
              alt="Minutes Ahead Logo"
              width={44}
              height={44}
              priority
            />
          </div>
          <div className="brand-titles">
            <div className="brand-name-row">
              <span className="brand-title">Minutes Ahead</span>
              <span className="brand-bolt text-amber-500">⚡</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
          <div className="digital-india-container hidden sm:flex items-center">
            <Image
              src="/digital-india.png"
              alt="Digital India - Power To Empower"
              width={120}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Right: Hamburger Menu Button */}
        <div>
          <button
            onClick={onOpenMenu}
            className="hamburger-btn"
            title="Menu & Resources"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2E7D32"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span>{lang === "hi" ? "मेन्यू" : "MENU"}</span>
          </button>
        </div>
      </div>

      {/* ── Row 2: Main Navigation Bar ────────────────────────────── */}
      <div className="main-navbar">
        <nav className="nav-tabs">
          <button
            onClick={() => onTabChange("home")}
            className={`nav-tab-btn ${currentTab === "home" ? "active" : ""}`}
          >
            <span>{lang === "hi" ? "मुख्य पृष्ठ" : "Home"}</span>
          </button>

          <button
            onClick={() => onTabChange("dashboard")}
            className={`nav-tab-btn ${currentTab === "dashboard" ? "active" : ""}`}
          >
            <span>{lang === "hi" ? "मैप डैशबोर्ड" : "Map Dashboard"}</span>
          </button>

          <button
            onClick={() => onTabChange("about")}
            className={`nav-tab-btn ${currentTab === "about" ? "active" : ""}`}
          >
            <span>{lang === "hi" ? "हमारे बारे में" : "About Us"}</span>
          </button>
        </nav>

        {/* Live IST Clock */}
        <div className="nav-right-clock">
          <span className="clock-dot"></span>
          <span className="clock-label">IST</span>
          <span className="clock-time">{istTime || "--:--:--"}</span>
        </div>
      </div>
    </header>
  );
}
