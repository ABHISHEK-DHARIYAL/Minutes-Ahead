"use client";

import { useState } from "react";

interface AIPredictionConfidenceProps {
  thunderstormProb?: number;
  lightningProb?: number;
  aiConfidence?: number;
  locationName?: string | null;
  isCompact?: boolean;
}

// Circular progress gauge component with SVG
function CircularGauge({
  value,
  label,
  color,
  sublabel,
  size = 72,
  strokeWidth = 6,
}: {
  value: number;
  label: string;
  color: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        {/* Center Value */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: size > 80 ? "18px" : "15px", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>
            {value}%
          </span>
        </div>
      </div>
      <span style={{ fontSize: "10px", fontWeight: 700, color: "#334155", marginTop: "6px", lineHeight: 1.2 }}>
        {label}
      </span>
      {sublabel && (
        <span style={{ fontSize: "9px", color: "#64748B", marginTop: "1px" }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

export default function AIPredictionConfidence({
  thunderstormProb = 82,
  lightningProb = 74,
  aiConfidence = 91,
  locationName,
  isCompact = false,
}: AIPredictionConfidenceProps) {
  const [whyExpanded, setWhyExpanded] = useState(false);

  const sources = [
    { name: "Radar", icon: "📡", color: "var(--clr-primary-800, #2E7D32)" },
    { name: "Satellite", icon: "🛰️", color: "#00796B" },
    { name: "Lightning", icon: "⚡", color: "#D97706" },
    { name: "Atmospheric Conditions", icon: "🌡️", color: "#16A34A" },
    { name: "Weather Model", icon: "🌐", color: "#4F46E5" },
  ];

  return (
    <div
      className="esam-card"
      style={{
        padding: isCompact ? "10px 12px" : "12px 14px",
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--clr-primary-200, #C8E6C9)",
        borderRadius: "10px",
        boxShadow: "var(--shadow-card, 0 2px 8px rgba(0, 0, 0, 0.06))",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "6px",
              backgroundColor: "var(--clr-primary-50, #EDF7EE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--clr-primary-800, #2E7D32)",
              fontSize: "12px",
              border: "1px solid var(--clr-primary-200, #C8E6C9)",
            }}
          >
            📊
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--clr-gray-900, #1E1E1B)", letterSpacing: "0.03em" }}>
              AI PREDICTION CONFIDENCE
            </div>
            {locationName && (
              <div style={{ fontSize: "9px", color: "var(--clr-gray-500, #737370)", fontWeight: 600 }}>
                Target: {locationName}
              </div>
            )}
          </div>
        </div>
        <span
          style={{
            fontSize: "8.5px",
            padding: "2px 7px",
            borderRadius: "9999px",
            backgroundColor: "#FEF3C7",
            color: "#92400E",
            fontWeight: 800,
            letterSpacing: "0.02em",
            border: "1px solid #FDE68A",
          }}
        >
          DEMO DATA
        </span>
      </div>

      {/* 3 Circular Gauges */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
          padding: "8px 4px 10px 4px",
          borderBottom: "1px solid var(--clr-primary-100, #E8F5E9)",
          backgroundColor: "var(--clr-primary-50, #EDF7EE)",
          borderRadius: "8px",
          border: "1px solid var(--clr-primary-200, #C8E6C9)",
        }}
      >
        <CircularGauge
          value={thunderstormProb}
          label="Thunderstorm"
          sublabel="Probability"
          color="#EA580C"
          size={isCompact ? 64 : 70}
          strokeWidth={5}
        />
        <CircularGauge
          value={lightningProb}
          label="Lightning"
          sublabel="Probability"
          color="#D97706"
          size={isCompact ? 64 : 70}
          strokeWidth={5}
        />
        <CircularGauge
          value={aiConfidence}
          label="AI Model"
          sublabel="Confidence"
          color="var(--clr-primary-800, #2E7D32)"
          size={isCompact ? 64 : 70}
          strokeWidth={5}
        />
      </div>

      {/* Prediction based on Sources */}
      <div style={{ marginTop: "10px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--clr-gray-700, #3E3E38)", marginBottom: "5px" }}>
          Prediction based on:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {sources.map((src, idx) => (
            <span
              key={src.name}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "9.5px",
                fontWeight: 600,
                color: "var(--clr-gray-900, #1E1E1B)",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--clr-gray-200, #E8E8E4)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              <span>{src.icon}</span>
              <span>{src.name}</span>
              {idx < sources.length - 1 && (
                <span style={{ color: "var(--clr-gray-400, #9E9E98)", marginLeft: "2px", fontWeight: 400 }}>+</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable "Why this prediction?" Section */}
      <div style={{ marginTop: "10px", borderTop: "1px solid var(--clr-primary-100, #E8F5E9)", paddingTop: "8px" }}>
        <button
          onClick={() => setWhyExpanded(!whyExpanded)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "none",
            border: "none",
            padding: "4px 0",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--clr-primary-800, #2E7D32)", display: "flex", alignItems: "center", gap: "4px" }}>
            <span>💡</span>
            <span>Why this prediction?</span>
          </span>
          <span style={{ fontSize: "11px", color: "var(--clr-gray-500, #737370)", fontWeight: 700 }}>
            {whyExpanded ? "▲ Hide" : "▼ Explain"}
          </span>
        </button>

        {whyExpanded && (
          <div
            style={{
              marginTop: "8px",
              padding: "10px 12px",
              backgroundColor: "var(--clr-primary-50, #EDF7EE)",
              border: "1px solid var(--clr-primary-200, #C8E6C9)",
              borderRadius: "6px",
              fontSize: "11px",
              lineHeight: 1.55,
              color: "var(--clr-gray-700, #3E3E38)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div>
              <strong style={{ color: "var(--clr-primary-900, #1B5E20)" }}>Radar Echo Core:</strong> Doppler radar reflectivity exceeds 48 dBZ, indicating intense precipitation and graupel formation in the cloud column.
            </div>
            <div>
              <strong style={{ color: "var(--clr-primary-900, #1B5E20)" }}>Rapid Satellite Cooling:</strong> INSAT-3D thermal IR records cloud-top cooling down to -64.5°C, confirming strong explosive convective updrafts.
            </div>
            <div>
              <strong style={{ color: "var(--clr-primary-900, #1B5E20)" }}>Lightning Cluster Surge:</strong> Ground detection network recorded over 38 flashes/min in the approaching storm cell cluster.
            </div>
            <div>
              <strong style={{ color: "var(--clr-primary-900, #1B5E20)" }}>Atmospheric Conditions:</strong> Extreme thermodynamic instability (CAPE: 2,240 J/kg) and strong wind shear (19.5 m/s) support sustained storm cell longevity.
            </div>
            <div>
              <strong style={{ color: "var(--clr-primary-900, #1B5E20)" }}>Numerical Weather Model:</strong> WRF / NCUM 3km high-resolution model predicts low-level moisture convergence along the convective front.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
