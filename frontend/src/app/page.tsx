"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import TopHeader from "@/components/TopHeader";
import HamburgerDrawer from "@/components/HamburgerDrawer";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import TimeScrubber from "@/components/TimeScrubber";
import HomePageView from "@/components/HomePageView";
import AboutPageView from "@/components/AboutPageView";
import SafetyPageView from "@/components/SafetyPageView";
import { LiveWeatherData } from "@/data/indiaData";
import { fetchLiveIndiaWeather } from "@/data/weatherService";

const StormMap = dynamic(() => import("@/components/StormMap"), {
  ssr: false,
  loading: () => null,
});

export type AppMode = "public" | "forecaster";
export type DataMode = "LIVE" | "REPLAY" | "SYNTHETIC";
export type Lang = "en" | "hi";

export interface StormCard {
  id: string;
  lat: number;
  lon: number;
  severity: "NONE" | "MODERATE" | "SEVERE" | "EXTREME";
  severity_color: string;
  max_reflectivity: number;
  area_km2: number;
  speed_kmh: number;
  direction_deg: number;
  confidence: number;
  nearest_district: string | null;
  eta_minutes: number | null;
  track_history: [number, number][];
  timestamp: string;
}

export interface NowcastData {
  timestamp: string;
  mode: DataMode;
  storm_cards: StormCard[];
  lightning_prob_grid: number[][];
  reflectivity_fields: Record<string, number[][]>;
  channel_importance: Record<string, number>;
  grid: { lat_min: number; lat_max: number; lon_min: number; lon_max: number; ny: number; nx: number };
}

const ML_API = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8001";

export default function HomePage() {
  // Navigation tabs: 'home' | 'nowcast' | 'safety' | 'about' (Default to home)
  const [currentTab, setCurrentTab] = useState<"home" | "nowcast" | "safety" | "about">("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // App mode & language (English / Hindi only)
  const [appMode, setAppMode] = useState<AppMode>("public");
  const [lang, setLang] = useState<Lang>("en");
  const [muted, setMuted] = useState(false);

  // Live real India stations weather
  const [weatherData, setWeatherData] = useState<LiveWeatherData[]>([]);
  const [selectedStation, setSelectedStation] = useState<LiveWeatherData | null>(null);

  // Active layers
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    radar: true,
    satellite: true,
    lightning: true,
    radarRings: true,
    riskZones: true,
    stateBorders: true,
  });

  // Storm and Nowcast State
  const [nowcast, setNowcast] = useState<NowcastData | null>(null);
  const [selectedStorm, setSelectedStorm] = useState<StormCard | null>(null);
  const [selectedLead, setSelectedLead] = useState(60);
  const [scrubOffset, setScrubOffset] = useState(0);

  // Simulated & Live Lightning Strikes
  const [lightning, setLightning] = useState<{ lat: number; lon: number; t: number }[]>([]);

  // Camera fly-to coordinates
  const [flyToCoord, setFlyToCoord] = useState<{ lat: number; lon: number } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Theme State (Light vs Dark Mode)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load theme from localStorage on client mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("minutes_ahead_theme") as "light" | "dark" | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      } else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.classList.add("dark");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("minutes_ahead_theme", nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
      } catch {
        // ignore
      }
      return nextTheme;
    });
  };

  // Controlled panel tabs & mobile views
  const [leftPanelTab, setLeftPanelTab] = useState<"stations" | "atmosphere" | "sources" | "radars" | "layers">("stations");
  const [rightPanelTab, setRightPanelTab] = useState<"warnings" | "prediction" | "storms" | "forecaster">("warnings");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState<"map" | "left" | "right">("map");

  // Visual action feedback toast banner state
  const [actionFeedback, setActionFeedback] = useState<{
    icon: string;
    title: string;
    titleHi: string;
    badge: string;
  } | null>(null);

  // Active glowing highlight on panels or scrubber
  const [highlightTarget, setHighlightTarget] = useState<"left" | "right" | "scrubber" | "map" | null>(null);

  const handleNavigateMenuItem = (target: "nowcast" | "minutes-ahead" | "stations" | "atmosphere" | "warnings" | "prediction") => {
    handleTabChange("nowcast");
    setIsMenuOpen(false);

    // Map each menu item to a bold, prominent visual toast notification & panel highlight
    const feedbackMap: Record<string, { icon: string; title: string; titleHi: string; badge: string; highlight: "left" | "right" | "scrubber" | "map" }> = {
      nowcast: {
        icon: "📡",
        title: "Live Convective Nowcast Map",
        titleHi: "लाइव मौसम एवं नाउकास्ट मैप",
        badge: "MAP VIEW",
        highlight: "map",
      },
      "minutes-ahead": {
        icon: "⏱️",
        title: "Minutes Ahead (+30m Convective Forecast)",
        titleHi: "मिनट्स अहेड (+30 मिनट पूर्वानुमान)",
        badge: "TIMELINE",
        highlight: "scrubber",
      },
      stations: {
        icon: "🛰️",
        title: "Surface Observation Stations",
        titleHi: "वेधशाला स्टेशन नेटवर्क (30+ स्टेशन)",
        badge: "LEFT PANEL",
        highlight: "left",
      },
      atmosphere: {
        icon: "🌡️",
        title: "Atmospheric Telemetry & Soundings",
        titleHi: "वायुमंडलीय स्थितियां एवं स्थिरता (CAPE)",
        badge: "LEFT PANEL",
        highlight: "left",
      },
      warnings: {
        icon: "⚡",
        title: "Active Storm Cells & Warnings",
        titleHi: "सक्रिय चक्रवाती तूफान एवं पूर्व-चेतावनियां",
        badge: "RIGHT PANEL",
        highlight: "right",
      },
      prediction: {
        icon: "📊",
        title: "AI Convective Prediction Confidence",
        titleHi: "एआई भविष्यवाणी एवं मॉडल सटीकता",
        badge: "RIGHT PANEL",
        highlight: "right",
      },
    };

    const fb = feedbackMap[target];
    if (fb) {
      setActionFeedback({
        icon: fb.icon,
        title: fb.title,
        titleHi: fb.titleHi,
        badge: fb.badge,
      });
      setHighlightTarget(fb.highlight);

      setTimeout(() => {
        setHighlightTarget(null);
      }, 2400);

      setTimeout(() => {
        setActionFeedback(null);
      }, 3400);
    }

    if (target === "nowcast") {
      setSelectedLead(0);
      setScrubOffset(0);
      setMobileActiveView("map");
    } else if (target === "minutes-ahead") {
      setSelectedLead(30);
      setScrubOffset(30);
      setMobileActiveView("map");
    } else if (target === "stations") {
      setLeftPanelTab("stations");
      setLeftPanelCollapsed(false);
      setMobileActiveView("left");
    } else if (target === "atmosphere") {
      setLeftPanelTab("atmosphere");
      setLeftPanelCollapsed(false);
      setMobileActiveView("left");
    } else if (target === "warnings") {
      setRightPanelTab("warnings");
      setRightPanelCollapsed(false);
      setMobileActiveView("right");
    } else if (target === "prediction") {
      setRightPanelTab("prediction");
      setRightPanelCollapsed(false);
      setMobileActiveView("right");
    }
  };

  // ── Fetch Live India Weather Data ─────────────────────────────────
  const loadWeatherData = useCallback(async () => {
    try {
      const data = await fetchLiveIndiaWeather();
      setWeatherData(data);
    } catch (err) {
      console.error("Error loading weather data:", err);
    }
  }, []);

  useEffect(() => {
    loadWeatherData();
    const interval = setInterval(loadWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeatherData]);

  // ── Fetch Nowcast Storm Cells ─────────────────────────────────────
  const loadNowcast = useCallback(async () => {
    try {
      const res = await fetch(`${ML_API}/nowcast`);
      if (!res.ok) throw new Error();
      const d: NowcastData = await res.json();
      setNowcast(d);
    } catch {
      setNowcast(buildIndiaNowcastMock());
    }
  }, []);

  useEffect(() => {
    loadNowcast();
    const interval = setInterval(loadNowcast, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNowcast]);

  // ── Simulated Lightning Strikes over Indian Convective Hotspots ───
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() < 0.4) {
        const hotspots = [
          [22.5 + Math.random() * 2, 87.5 + Math.random() * 2], // Bengal/Odisha
          [21.0 + Math.random() * 2, 79.0 + Math.random() * 2], // Vidarbha/Central
          [26.0 + Math.random() * 2, 91.5 + Math.random() * 2], // Assam/Meghalaya
          [17.0 + Math.random() * 2, 82.0 + Math.random() * 2], // Andhra Coast
          [10.0 + Math.random() * 2, 76.5 + Math.random() * 2], // Kerala Coast
        ];
        const [lat, lon] = hotspots[Math.floor(Math.random() * hotspots.length)];
        const strike = { lat, lon, t: Date.now() };

        setLightning((prev) => [...prev.slice(-40), strike]);

        if (!muted && Math.random() < 0.25) {
          playAlertChime(audioCtxRef);
        }
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [muted]);

  // ── Smooth Tab Navigation Transition (Instant 0ms Map Switch) ──
  const handleTabChange = (newTab: "home" | "nowcast" | "safety" | "about") => {
    if (newTab === currentTab) return;
    setCurrentTab(newTab);
    if (newTab === "nowcast") {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 30);
    }
  };

  // Immediate map resize when switching to nowcast
  useEffect(() => {
    if (currentTab === "nowcast") {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [currentTab]);

  const handleToggleLayer = (layerId: string) => {
    setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  return (
    <div className="app-container">
      {/* 2-Row Top Header */}
      <TopHeader
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenMenu={() => setIsMenuOpen(true)}
        lang={lang}
        onLangChange={setLang}
      />

      {/* Hamburger Drawer Menu (Opens from right) */}
      <HamburgerDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        lang={lang}
        onNavigateItem={handleNavigateMenuItem}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* ── Prominent Visual Action Toast / Feedback Banner ──────────── */}
      {actionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="action-feedback-toast"
          style={{
            position: "fixed",
            top: "122px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            color: "var(--clr-primary-950, #0D2811)",
            padding: "8px 20px",
            borderRadius: "var(--radius-full)",
            border: "2px solid var(--clr-primary-700, #388E3C)",
            boxShadow: "0 10px 32px rgba(0, 0, 0, 0.22), 0 0 0 4px rgba(46, 125, 50, 0.2)",
            animation: "toastSlideBounce 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: "22px", lineHeight: 1 }}>{actionFeedback.icon}</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "9.5px", fontWeight: 800, color: "var(--clr-primary-800, #2E7D32)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {lang === "hi" ? "✓ अनुभाग खुला" : "✓ Section Activated"}
            </span>
            <span style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)", lineHeight: 1.2 }}>
              {lang === "hi" ? actionFeedback.titleHi : actionFeedback.title}
            </span>
          </div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              backgroundColor: "var(--clr-primary-100, #E8F5E9)",
              color: "var(--clr-primary-800, #2E7D32)",
              padding: "3px 9px",
              borderRadius: "9999px",
              letterSpacing: "0.04em",
              border: "1px solid var(--clr-primary-300, #A5D6A7)",
            }}
          >
            {actionFeedback.badge}
          </span>
        </div>
      )}

      {/* ── VIEW 1: Live Convective Nowcast (Always mounted so map is preloaded with 0ms transition) ── */}
      <div
        className="tab-transition-view"
        style={{
          display: currentTab === "nowcast" ? "flex" : "none",
          flexDirection: "column",
          flex: 1,
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <main style={{ position: "relative", flex: 1, width: "100%", height: "100%", overflow: "hidden" }}>
          {/* Full-bleed Leaflet + OpenStreetMap India Map */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <StormMap
              nowcast={nowcast}
              lightning={lightning}
              activeLayers={activeLayers}
              selectedLead={selectedLead}
              scrubOffset={scrubOffset}
              selectedStorm={selectedStorm}
              onStormSelect={setSelectedStorm}
              weatherData={weatherData}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
              flyToCoord={flyToCoord}
              isActive={currentTab === "nowcast"}
            />
          </div>

            {/* Mobile View Floating Quick-Access 2 Boxes (Only on Mobile screens <= 768px) */}
            <div className="mobile-map-quick-boxes">
              <button
                id="btn-mobile-stations"
                onClick={() => {
                  setMobileActiveView(mobileActiveView === "left" ? "map" : "left");
                  setLeftPanelCollapsed(false);
                }}
                className={`mobile-floating-pill ${mobileActiveView === "left" ? "active" : ""}`}
                title="Observatory Stations & Atmospheric Telemetry"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--clr-primary-800, #2E7D32)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                  <span style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
                    {lang === "hi" ? "वेधशाला स्टेशन" : "Observatory Stations"} ({weatherData.length})
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--clr-primary-700, #2E7D32)", fontWeight: 800, flexShrink: 0 }}>→</span>
              </button>

              <button
                id="btn-mobile-warnings"
                onClick={() => {
                  setMobileActiveView(mobileActiveView === "right" ? "map" : "right");
                  setRightPanelCollapsed(false);
                }}
                className={`mobile-floating-pill ${mobileActiveView === "right" ? "active" : ""}`}
                title="Early Warnings & Convective Storm Cells"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                  <span style={{ fontSize: "14px", flexShrink: 0 }}>⚡</span>
                  <span style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
                    {lang === "hi" ? "पूर्व चेतावनी" : "Early Warnings"} ({nowcast?.storm_cards?.length ?? 0})
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--clr-primary-700, #2E7D32)", fontWeight: 800, flexShrink: 0 }}>→</span>
              </button>
            </div>

            {/* Left Panel (Stations / Atmosphere / Radars / Layers) */}
            <div className={`dashboard-panel-left ${mobileActiveView === "left" ? "mobile-show" : "mobile-hide"} ${highlightTarget === "left" ? "panel-action-pulse" : ""}`}>
              <LeftPanel
                weatherData={weatherData}
                onSelectStation={(st) => {
                  setSelectedStation(st);
                  setFlyToCoord({ lat: st.lat, lon: st.lon });
                }}
                selectedStation={selectedStation}
                activeLayers={activeLayers}
                onToggleLayer={handleToggleLayer}
                activeTabOverride={leftPanelTab}
                isCollapsedOverride={leftPanelCollapsed}
                onCloseMobile={() => setMobileActiveView("map")}
              />
            </div>

            {/* Right Panel (Storm Cells / Warnings / Safety Rules) */}
            <div className={`dashboard-panel-right ${mobileActiveView === "right" ? "mobile-show" : "mobile-hide"} ${highlightTarget === "right" ? "panel-action-pulse" : ""}`}>
              <RightPanel
                nowcast={nowcast}
                selectedStorm={selectedStorm}
                onSelect={(s) => {
                  setSelectedStorm(s);
                  if (s) setFlyToCoord({ lat: s.lat, lon: s.lon });
                }}
                lang={lang}
                appMode={appMode}
                mlApiUrl={ML_API}
                activeTabOverride={rightPanelTab}
                isCollapsedOverride={rightPanelCollapsed}
                onCloseMobile={() => setMobileActiveView("map")}
              />
            </div>

            {/* Bottom Timeline Scrubber */}
            <div className={`bottom-scrubber-bar ${highlightTarget === "scrubber" ? "scrubber-action-pulse" : ""}`}>
              <TimeScrubber
                value={scrubOffset}
                onChange={setScrubOffset}
                onLeadChange={setSelectedLead}
              />
            </div>
          </main>
        </div>

      {/* ── VIEW 2: Safety Portal (National Thunderstorm & Lightning Safety Protocol) ── */}
      {currentTab === "safety" && (
        <div key="safety" className="tab-transition-view">
          <SafetyPageView
            onGoToNowcast={() => handleTabChange("nowcast")}
            lang={lang}
          />
        </div>
      )}

      {/* ── VIEW 3: Home Page (e-Samanvit Portal Style) ─────────────── */}
      {currentTab === "home" && (
        <div key="home" className="tab-transition-view">
          <HomePageView
            onGoToDashboard={() => handleTabChange("nowcast")}
            onGoToAbout={() => handleTabChange("about")}
            onGoToSafety={() => handleTabChange("safety")}
            nowcast={nowcast}
            weatherData={weatherData}
            lang={lang}
          />
        </div>
      )}

      {/* ── VIEW 4: About Us Page (SIH / MoES Mission Details) ───────── */}
      {currentTab === "about" && (
        <div key="about" className="tab-transition-view">
          <AboutPageView
            onGoToDashboard={() => handleTabChange("nowcast")}
            lang={lang}
          />
        </div>
      )}
    </div>
  );
}

// ── Realistic Indian Convective Storm Nowcast Cells ───────────────────
function buildIndiaNowcastMock(): NowcastData {
  const cards: StormCard[] = [
    {
      id: "CELL-IND-01",
      lat: 22.58,
      lon: 88.38,
      severity: "SEVERE",
      severity_color: "#ea580c",
      max_reflectivity: 54.2,
      area_km2: 520,
      speed_kmh: 42,
      direction_deg: 240,
      confidence: 0.88,
      nearest_district: "Kolkata (South 24 Parganas)",
      eta_minutes: 25,
      track_history: [
        [22.35, 88.1],
        [22.45, 88.22],
        [22.58, 88.38],
      ],
      timestamp: new Date().toISOString(),
    },
    {
      id: "CELL-IND-02",
      lat: 20.32,
      lon: 85.85,
      severity: "EXTREME",
      severity_color: "#dc2626",
      max_reflectivity: 62.5,
      area_km2: 740,
      speed_kmh: 38,
      direction_deg: 215,
      confidence: 0.94,
      nearest_district: "Bhubaneswar / Cuttack",
      eta_minutes: 15,
      track_history: [
        [20.5, 85.65],
        [20.4, 85.75],
        [20.32, 85.85],
      ],
      timestamp: new Date().toISOString(),
    },
    {
      id: "CELL-IND-03",
      lat: 21.15,
      lon: 79.1,
      severity: "MODERATE",
      severity_color: "#ca8a04",
      max_reflectivity: 39.8,
      area_km2: 310,
      speed_kmh: 28,
      direction_deg: 260,
      confidence: 0.72,
      nearest_district: "Nagpur (Vidarbha)",
      eta_minutes: 45,
      track_history: [
        [21.05, 79.35],
        [21.1, 79.22],
        [21.15, 79.1],
      ],
      timestamp: new Date().toISOString(),
    },
    {
      id: "CELL-IND-04",
      lat: 26.18,
      lon: 91.75,
      severity: "SEVERE",
      severity_color: "#ea580c",
      max_reflectivity: 51.0,
      area_km2: 440,
      speed_kmh: 32,
      direction_deg: 290,
      confidence: 0.85,
      nearest_district: "Guwahati (Kamrup)",
      eta_minutes: 30,
      track_history: [
        [26.05, 91.95],
        [26.12, 91.85],
        [26.18, 91.75],
      ],
      timestamp: new Date().toISOString(),
    },
  ];

  return {
    timestamp: new Date().toISOString(),
    mode: "LIVE",
    storm_cards: cards,
    lightning_prob_grid: [],
    reflectivity_fields: {},
    channel_importance: {
      Radar: 0.42,
      Satellite: 0.28,
      Lightning: 0.18,
      NWP: 0.12,
    },
    grid: {
      lat_min: 6,
      lat_max: 38,
      lon_min: 66,
      lon_max: 98,
      ny: 32,
      nx: 32,
    },
  };
}

// ── Soft Meteorological Alert Tone ──────────────────────────────────
function playAlertChime(ref: React.MutableRefObject<AudioContext | null>) {
  try {
    if (!ref.current) {
      ref.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = ref.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}
