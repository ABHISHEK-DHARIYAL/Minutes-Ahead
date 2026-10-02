"use client";
import { useEffect, useState } from "react";
import { INDIA_STATIONS } from "@/data/indiaData";

interface TopBarProps {
  appMode: "public" | "forecaster";
  onModeToggle: () => void;
  lang: "en" | "hi" | "gu" | "bn";
  onLangChange: (l: "en" | "hi" | "gu" | "bn") => void;
  muted: boolean;
  onMuteToggle: () => void;
  onFlyToStation: (lat: number, lon: number) => void;
  dataUpdatedTime: string | null;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export default function TopBar({
  appMode,
  onModeToggle,
  lang,
  onLangChange,
  muted,
  onMuteToggle,
  onFlyToStation,
  dataUpdatedTime,
  onRefreshData,
  isRefreshing,
}: TopBarProps) {
  const [istTime, setIstTime] = useState("");
  const [utcTime, setUtcTime] = useState("");

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
      setUtcTime(
        now.toLocaleTimeString("en-GB", {
          timeZone: "UTC",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#ffffff] border-b border-[#e2e8f0] px-5 flex items-center justify-between select-none z-30 relative shadow-xs">
      {/* Left: Official IMD & National branding (e-Samanvit style) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-xl shadow-xs">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-[#0f2744] text-lg">
                VAJRANET
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#1e3a8a] font-semibold border border-[#cbd5e1]">
                वज्रनेत्र
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#ecfdf5] text-[#15803d] font-medium border border-[#bbf7d0]">
                IMD-MoES
              </span>
            </div>
            <div className="text-xs text-[#64748b] hidden sm:block">
              National AI/ML Thunderstorm & Lightning Nowcasting Portal · Govt. of India
            </div>
          </div>
        </div>

        {/* Quick Station Navigation */}
        <div className="hidden lg:flex items-center ml-5 pl-5 border-l border-[#e2e8f0]">
          <label className="text-xs font-medium text-[#64748b] mr-2">Station:</label>
          <select
            aria-label="Jump to Indian Station"
            onChange={(e) => {
              const st = INDIA_STATIONS.find((s) => s.id === e.target.value);
              if (st) onFlyToStation(st.lat, st.lon);
            }}
            defaultValue=""
            className="bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] text-xs font-medium rounded-md px-3 py-1.5 outline-none hover:border-[#94a3b8] focus:border-[#2563eb] transition-colors"
          >
            <option value="" disabled>Search Indian Station...</option>
            {INDIA_STATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Live Real Data Status & Clock */}
      <div className="hidden md:flex items-center gap-4">
        {/* Live Data Badge */}
        <div className="flex items-center gap-2 bg-[#f0fdf4] px-3.5 py-1.5 rounded-full border border-[#bbf7d0]">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-800">
            LIVE SYNOPTIC TELEMETRY (INDIA)
          </span>
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Refresh Indian Synoptic Observations"
            className="text-xs text-[#475569] hover:text-[#0f172a] transition-colors ml-1 font-bold"
          >
            {isRefreshing ? "⏳" : "🔄"}
          </button>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-2.5 text-xs text-[#475569]">
          <div className="bg-[#f8fafc] px-3 py-1.5 rounded-md border border-[#e2e8f0]">
            <span className="text-[#64748b] font-medium mr-1.5">IST</span>
            <span className="font-bold text-[#0f172a] font-mono">{istTime || "--:--:--"}</span>
          </div>
          <div className="text-[#64748b] hidden xl:block font-mono text-[11px]">
            {utcTime} UTC
          </div>
        </div>
      </div>

      {/* Right: Controls & Language */}
      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <div className="flex items-center bg-[#f8fafc] rounded-md border border-[#cbd5e1] p-0.5 text-xs font-medium">
          {[
            { id: "en", label: "English" },
            { id: "hi", label: "हिन्दी" },
            { id: "gu", label: "ગુજરાતી" },
            { id: "bn", label: "বাংলা" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onLangChange(item.id as any)}
              className={`px-2.5 py-1 rounded transition-colors ${
                lang === item.id
                  ? "bg-[#1e3a8a] text-white shadow-xs font-semibold"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={onMuteToggle}
          title={muted ? "Unmute Early Warning Chime" : "Mute Early Warning Chime"}
          className={`p-2 rounded-md border text-sm transition-colors ${
            muted
              ? "bg-[#f8fafc] border-[#cbd5e1] text-[#94a3b8]"
              : "bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8]"
          }`}
        >
          {muted ? "🔇" : "🔔"}
        </button>

        {/* Forecaster vs Public Mode */}
        <button
          onClick={onModeToggle}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
            appMode === "forecaster"
              ? "bg-[#1e3a8a] border-[#1e3a8a] text-white"
              : "bg-[#ffffff] border-[#cbd5e1] text-[#1e293b] hover:border-[#94a3b8]"
          }`}
        >
          <span>{appMode === "forecaster" ? "🔬 Forecaster" : "👥 Public Portal"}</span>
        </button>
      </div>
    </header>
  );
}
