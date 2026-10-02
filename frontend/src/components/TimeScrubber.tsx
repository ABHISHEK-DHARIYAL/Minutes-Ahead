"use client";
import { useEffect, useState } from "react";

interface TimeScrubberProps {
  value: number;
  onChange: (v: number) => void;
  onLeadChange: (lead: number) => void;
}

const TIMESTEPS = [-60, -30, 0, 15, 30, 60, 90, 120, 180];

export default function TimeScrubber({ value, onChange, onLeadChange }: TimeScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const curIdx = TIMESTEPS.indexOf(value);
      const nextIdx = (curIdx + 1) % TIMESTEPS.length;
      const nextVal = TIMESTEPS[nextIdx];
      onChange(nextVal);
      if (nextVal > 0) onLeadChange(nextVal);
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying, value, onChange, onLeadChange]);

  const getLabel = () => {
    if (value === 0) return "CURRENT SCAN (T+0)";
    if (value < 0) return `${Math.abs(value)}m PAST OBSERVATION`;
    return `+${value}m AI NOWCAST`;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        width: "100%",
      }}
    >
      {/* Play/Pause Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            border: "1px solid #CBD5E1",
            color: "#1B5E20",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "bold",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
          title={isPlaying ? "Pause Forecast Loop" : "Play Forecast Loop"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#0F172A", display: "block" }}>
            {getLabel()}
          </span>
          <span style={{ fontSize: "10px", color: "#64748B" }}>
            {value > 0 ? "ML Convective Extrapolation" : "Doppler Radar Mosaic"}
          </span>
        </div>
      </div>

      {/* Discrete Step Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", overflowX: "auto" }}>
        {TIMESTEPS.map((step) => {
          const isSelected = value === step;
          const isNow = step === 0;

          return (
            <button
              key={step}
              onClick={() => {
                onChange(step);
                if (step > 0) onLeadChange(step);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontFamily: "monospace",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
                border: isSelected ? "1px solid #2E7D32" : "1px solid #CBD5E1",
                backgroundColor: isSelected
                  ? isNow ? "#16A34A" : "#2E7D32"
                  : "#ffffff",
                color: isSelected ? "#ffffff" : "#475569",
                boxShadow: isSelected ? "0 2px 6px rgba(46,125,50,0.25)" : "none",
              }}
            >
              {isNow ? "NOW" : step > 0 ? `+${step}m` : `${step}m`}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", color: "#64748B", fontWeight: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1E3A8A" }}></span>
          <span>Observed</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16A34A" }}></span>
          <span>Now</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#2E7D32" }}></span>
          <span>Forecast</span>
        </div>
      </div>
    </div>
  );
}
