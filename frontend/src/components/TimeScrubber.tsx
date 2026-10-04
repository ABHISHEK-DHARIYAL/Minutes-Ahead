"use client";
import { useEffect, useState } from "react";

interface TimeScrubberProps {
  value: number;
  onChange: (v: number) => void;
  onLeadChange: (lead: number) => void;
}

const TIMESTEPS = [-60, -30, 0, 15, 30, 60, 90, 120, 180];

const CONFIDENCE_MAP: Record<number, string> = {
  15: "98% AI Confidence",
  30: "92% AI Confidence",
  60: "86% AI Confidence",
  90: "79% AI Confidence",
  120: "68% AI Confidence",
  180: "55% AI Confidence",
};

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
    }, 1600);
    return () => clearInterval(interval);
  }, [isPlaying, value, onChange, onLeadChange]);

  const getStatusInfo = () => {
    if (value === 0) {
      return {
        badge: "T+0 NOW",
        title: "Current Radar Scan",
        sub: "Doppler Composite Mosaic",
        color: "var(--clr-primary-800, #2E7D32)",
      };
    }
    if (value < 0) {
      return {
        badge: `${Math.abs(value)}m PAST`,
        title: "Historical Telemetry",
        sub: "Radar Observation Archive",
        color: "var(--clr-gray-500, #737370)",
      };
    }
    return {
      badge: `+${value}m NOWCAST`,
      title: "AI Convective Lead",
      sub: CONFIDENCE_MAP[value] || "Deep Learning Trajectory",
      color: "var(--clr-primary-800, #2E7D32)",
    };
  };

  const status = getStatusInfo();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        width: "100%",
        userSelect: "none",
      }}
    >
      {/* ── Left: Play/Pause Controller & Live Status ─────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: isPlaying ? "var(--clr-primary-800, #2E7D32)" : "var(--clr-white, #FFFFFF)",
            border: isPlaying ? "1px solid var(--clr-primary-800, #2E7D32)" : "1px solid var(--clr-primary-300, #A5D6A7)",
            color: isPlaying ? "#FFFFFF" : "var(--clr-primary-800, #2E7D32)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "var(--shadow-card, 0 2px 6px rgba(46, 125, 50, 0.15))",
            transition: "all 0.18s ease",
            flexShrink: 0,
          }}
          title={isPlaying ? "Pause Forecast Loop" : "Play Nowcast Loop"}
        >
          {isPlaying ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1.5" />
              <rect x="14" y="4" width="4" height="16" rx="1.5" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#FFFFFF",
                backgroundColor: status.color,
                padding: "1px 6px",
                borderRadius: "4px",
                letterSpacing: "0.02em",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {value === 0 && (
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: "#81C784",
                    display: "inline-block",
                  }}
                />
              )}
              {status.badge}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "var(--clr-gray-900, #1E1E1B)",
                letterSpacing: "-0.01em",
              }}
            >
              {status.title}
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "var(--clr-gray-500, #737370)", fontWeight: 500 }}>
            {status.sub}
          </span>
        </div>
      </div>

      {/* ── Middle: Discrete Lead-Time Stepper Buttons ────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          backgroundColor: "var(--clr-primary-50, #EDF7EE)",
          padding: "3px 4px",
          borderRadius: "8px",
          border: "1px solid var(--clr-primary-200, #C8E6C9)",
          overflowX: "auto",
        }}
      >
        {TIMESTEPS.map((step) => {
          const isSelected = value === step;
          const isNow = step === 0;
          const isPast = step < 0;

          return (
            <button
              key={step}
              onClick={() => {
                onChange(step);
                if (step > 0) onLeadChange(step);
              }}
              style={{
                padding: isNow ? "5px 10px" : "5px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontFamily: "monospace",
                fontWeight: isSelected ? 800 : 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
                border: isSelected
                  ? "1px solid var(--clr-primary-800, #2E7D32)"
                  : "1px solid transparent",
                background: isSelected
                  ? "linear-gradient(135deg, var(--clr-primary-800, #2E7D32) 0%, var(--clr-primary-900, #1B5E20) 100%)"
                  : "transparent",
                color: isSelected
                  ? "#FFFFFF"
                  : isNow
                  ? "var(--clr-primary-900, #1B5E20)"
                  : isPast
                  ? "var(--clr-gray-500, #737370)"
                  : "var(--clr-gray-800, #2A2A26)",
                boxShadow: isSelected
                  ? "0 2px 6px rgba(46, 125, 50, 0.35)"
                  : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
              title={
                isNow
                  ? "Real-time radar scan (T+0)"
                  : step < 0
                  ? `${Math.abs(step)} minutes prior observation`
                  : `+${step} minutes AI convective nowcast`
              }
            >
              {isNow && (
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: isSelected ? "#81C784" : "var(--clr-primary-800, #2E7D32)",
                  }}
                />
              )}
              {isNow ? "NOW" : step > 0 ? `+${step}m` : `${step}m`}
            </button>
          );
        })}
      </div>

      {/* ── Right: Mini Telemetry Scale Indicator ──────────────────── */}
      <div
        className="time-scrubber-telemetry"
        style={{
          alignItems: "center",
          gap: "10px",
          fontSize: "10px",
          color: "var(--clr-gray-500, #737370)",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#9E9E98" }} />
          <span>Observed</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--clr-primary-800, #2E7D32)" }} />
          <span>Live (T+0)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--clr-primary-600, #43A047)" }} />
          <span>+90m Forecast</span>
        </div>
      </div>
    </div>
  );
}
