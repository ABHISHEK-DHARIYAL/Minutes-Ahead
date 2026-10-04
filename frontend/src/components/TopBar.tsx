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
    <header className="h-16 bg-[#ffffff] border-b border-[#C8E6C9] px-5 flex items-center justify-between select-none z-30 relative shadow-xs">
      {/* Left: Official IMD & National branding (e-Samanvit style) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#EDF7EE] border border-[#C8E6C9] flex items-center justify-center text-xl shadow-xs">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-[#1B5E20] text-lg">
                VAJRANET
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EDF7EE] text-[#1B5E20] font-semibold border border-[#C8E6C9]">
                वज्रनेत्र
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#EDF7EE] text-[#2E7D32] font-medium border border-[#C8E6C9]">
                IMD-MoES
              </span>
            </div>
            <div className="text-xs text-[#575752] hidden sm:block">
              National AI/ML Thunderstorm & Lightning Nowcasting Portal · Govt. of India
            </div>
          </div>
        </div>

        {/* Quick Station Navigation */}
        <div className="hidden lg:flex items-center ml-5 pl-5 border-l border-[#C8E6C9]">
          <label className="text-xs font-medium text-[#737370] mr-2">Station:</label>
          <select
            aria-label="Jump to Indian Station"
            onChange={(e) => {
              const st = INDIA_STATIONS.find((s) => s.id === e.target.value);
              if (st) onFlyToStation(st.lat, st.lon);
            }}
            defaultValue=""
            className="bg-[#FAFAF8] border border-[#C8E6C9] text-[#1E1E1B] text-xs font-medium rounded-md px-3 py-1.5 outline-none hover:border-[#81C784] focus:border-[#2E7D32] transition-colors"
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
        <div className="flex items-center gap-2 bg-[#EDF7EE] px-3.5 py-1.5 rounded-full border border-[#C8E6C9]">
          <span className="w-2 h-2 rounded-full bg-[#2E7D32] inline-block animate-pulse"></span>
          <span className="text-xs font-semibold text-[#1B5E20]">
            LIVE SYNOPTIC TELEMETRY (INDIA)
          </span>
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Refresh Indian Synoptic Observations"
            className="text-xs text-[#575752] hover:text-[#1B5E20] transition-colors ml-1 font-bold"
          >
            {isRefreshing ? "⏳" : "🔄"}
          </button>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-2.5 text-xs text-[#575752]">
          <div className="bg-[#FAFAF8] px-3 py-1.5 rounded-md border border-[#E8E8E4]">
            <span className="text-[#737370] font-medium mr-1.5">IST</span>
            <span className="font-bold text-[#1E1E1B] font-mono">{istTime || "--:--:--"}</span>
          </div>
          <div className="text-[#737370] hidden xl:block font-mono text-[11px]">
            {utcTime} UTC
          </div>
        </div>
      </div>

      {/* Right: Controls & Language */}
      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <div className="flex items-center bg-[#FAFAF8] rounded-md border border-[#C8E6C9] p-0.5 text-xs font-medium">
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
                  ? "bg-[#2E7D32] text-white shadow-xs font-semibold"
                  : "text-[#575752] hover:text-[#1E1E1B]"
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
              ? "bg-[#FAFAF8] border-[#E8E8E4] text-[#9E9E98]"
              : "bg-[#EDF7EE] border-[#C8E6C9] text-[#2E7D32]"
          }`}
        >
          {muted ? "🔇" : "🔔"}
        </button>

        {/* Forecaster vs Public Mode */}
        <button
          onClick={onModeToggle}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
            appMode === "forecaster"
              ? "bg-[#2E7D32] border-[#2E7D32] text-white shadow-xs"
              : "bg-[#ffffff] border-[#C8E6C9] text-[#1E1E1B] hover:border-[#81C784]"
          }`}
        >
          <span>{appMode === "forecaster" ? "🔬 Forecaster" : "👥 Public Portal"}</span>
        </button>
      </div>
    </header>
  );
}
