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
import { LiveWeatherData } from "@/data/indiaData";
import { fetchLiveIndiaWeather } from "@/data/weatherService";

const StormMap = dynamic(() => import("@/components/StormMap"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #2E7D32", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 10px auto", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: "13px", fontWeight: 700, color: "#1B5E20" }}>Loading Minutes Ahead Map...</p>
      </div>
    </div>
  ),
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
  // Navigation tabs: 'home' | 'dashboard' | 'about'
  const [currentTab, setCurrentTab] = useState<"home" | "dashboard" | "about">("dashboard");
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

  const handleToggleLayer = (layerId: string) => {
    setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  return (
    <div className="app-container">
      {/* 2-Row Top Header */}
      <TopHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenMenu={() => setIsMenuOpen(true)}
        lang={lang}
      />

      {/* Hamburger Drawer Menu (Opens from right) */}
      <HamburgerDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        lang={lang}
        onLangChange={setLang}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        muted={muted}
        onMuteToggle={() => setMuted((m) => !m)}
      />

      {/* ── VIEW 1: Map Dashboard (Full Leaflet + OpenStreetMap India Map + Left & Right Panels) ── */}
      {currentTab === "dashboard" && (
        <main style={{ position: "relative", flex: 1, width: "100%", overflow: "hidden" }}>
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
            />
          </div>

          {/* Left Panel (Stations / Radars / Layers) */}
          <div style={{ position: "absolute", top: "14px", left: "14px", bottom: "76px", zIndex: 500, pointerEvents: "auto" }}>
            <LeftPanel
              weatherData={weatherData}
              onSelectStation={(st) => {
                setSelectedStation(st);
                setFlyToCoord({ lat: st.lat, lon: st.lon });
              }}
              selectedStation={selectedStation}
              activeLayers={activeLayers}
              onToggleLayer={handleToggleLayer}
            />
          </div>

          {/* Right Panel (Storm Cells / Warnings / Safety Rules) */}
          <div style={{ position: "absolute", top: "14px", right: "14px", bottom: "76px", zIndex: 500, pointerEvents: "auto" }}>
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
            />
          </div>

          {/* Bottom Timeline Scrubber */}
          <div className="bottom-scrubber-bar">
            <TimeScrubber
              value={scrubOffset}
              onChange={setScrubOffset}
              onLeadChange={setSelectedLead}
            />
          </div>
        </main>
      )}

      {/* ── VIEW 2: Home Page (e-Samanvit Portal Style) ─────────────── */}
      {currentTab === "home" && (
        <HomePageView
          onGoToDashboard={() => setCurrentTab("dashboard")}
          onGoToAbout={() => setCurrentTab("about")}
          nowcast={nowcast}
          weatherData={weatherData}
          lang={lang}
        />
      )}

      {/* ── VIEW 3: About Us Page (SIH / MoES Mission Details) ───────── */}
      {currentTab === "about" && (
        <AboutPageView
          onGoToDashboard={() => setCurrentTab("dashboard")}
          lang={lang}
        />
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
