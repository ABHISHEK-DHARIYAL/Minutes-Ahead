"use client";
import { useState } from "react";
import type { NowcastData } from "@/app/page";
import { LiveWeatherData } from "@/data/indiaData";
import { CURRENT_ATMOSPHERIC_CONDITIONS } from "@/data/riskZonesData";
import AIPredictionConfidence from "@/components/AIPredictionConfidence";
import Footer from "@/components/Footer";

interface HomePageViewProps {
  onGoToDashboard: () => void;
  onGoToAbout: () => void;
  onGoToSafety?: () => void;
  nowcast: NowcastData | null;
  weatherData: LiveWeatherData[];
  lang: "en" | "hi";
}

export default function HomePageView({
  onGoToDashboard,
  onGoToAbout,
  onGoToSafety,
  nowcast,
  weatherData,
  lang,
}: HomePageViewProps) {
  const activeStormsCount = nowcast?.storm_cards.length ?? 4;
  const highCapeStations = weatherData.filter((s) => s.cape >= 1500);

  // Top stations for live display
  const keyCities = ["New Delhi", "Kolkata", "Mumbai", "Patna", "Bhubaneswar", "Nagpur", "Jaipur", "Bengaluru"];
  const spotlightStations = weatherData.filter((s) =>
    keyCities.some((c) => s.name.toLowerCase().includes(c.toLowerCase()))
  ).slice(0, 6);

  const displayStations = spotlightStations.length > 0 ? spotlightStations : weatherData.slice(0, 6);

  return (
    <div style={{ width: "100%", flex: 1, overflowY: "auto", backgroundColor: "var(--clr-gray-50)" }}>
      {/* ── 1. e-Samanvit Hero Banner Carousel Section ─────────────── */}
      <section
        style={{
          width: "100%",
          borderBottom: "2px solid var(--clr-primary-200)",
          padding: "48px 24px 44px 24px",
          background: "linear-gradient(180deg, #EDF7EE 0%, #F5FAF6 50%, #EAF4EB 100%)",
          boxShadow: "0 6px 24px rgba(27, 94, 32, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial decorative background light */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 65% 75% at 8% 50%, rgba(200, 230, 201, 0.35) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "40px",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Left: Brand Identity Box (e-Samanvit Logo Panel Style) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--clr-primary-100)",
              borderRadius: "var(--radius-xl)",
              padding: "24px",
              height: "280px",
              border: "1.5px solid var(--clr-primary-200)",
              boxShadow: "0 4px 24px rgba(46, 125, 50, 0.10)",
              position: "relative",
              overflow: "hidden",
              maxWidth: "340px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <div
              style={{
                width: "188px",
                height: "188px",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(46, 125, 50, 0.18)",
                border: "2px solid rgba(255, 255, 255, 0.9)",
                overflow: "hidden",
                padding: "2px",
              }}
            >
              <img
                src="logo.png"
                alt="Minutes Ahead Official Emblem"
                width={180}
                height={180}
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  clipPath: "circle(49% at 50% 50%)",
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes("/logo.png")) {
                    target.src = "/logo.png";
                  }
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                backgroundColor: "rgba(46, 125, 50, 0.92)",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              0–3h NOWCAST
            </div>
          </div>

          {/* Right: Hero Narrative Text & Interactive Actions */}
          <div>
            {/* Government Ministry & Verified Portal Chips */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
              <span className="esam-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                {lang === "hi" ? "सत्यापित मौसम पोर्टल" : "Verified Public Safety Portal"}
              </span>
              <span className="esam-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {lang === "hi" ? "24/7 लाइव रडार टेलीमेट्री" : "24/7 Live Telemetry"}
              </span>
              <span className="esam-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18" />
                </svg>
                17 Doppler Radars
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 3.8vw, 2.85rem)",
                fontWeight: 800,
                color: "var(--clr-primary-900)",
                lineHeight: 1.15,
                margin: "0 0 10px 0",
                letterSpacing: "-0.02em",
              }}
            >
              Minutes <span style={{ color: "var(--clr-primary-700)" }}>Ahead</span>
            </h1>

            <p
              style={{
                fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
                fontWeight: 700,
                color: "var(--clr-gray-800)",
                marginBottom: "8px",
                lineHeight: 1.35,
              }}
            >
              {lang === "hi"
                ? "आंधी-तूफान एवं आकाशीय बिजली (वज्रपात) की राष्ट्रीय तात्कालिक चेतावनी प्रणाली"
                : "AI/ML Multi-Sensor Nowcasting of Severe Thunderstorms & Lightning"}
            </p>

            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--clr-gray-600)",
                marginBottom: "24px",
                lineHeight: 1.6,
                maxWidth: "640px",
              }}
            >
              {lang === "hi"
                ? "भारत में हर साल आकाशीय बिजली से होने वाले जन-धन के नुकसान को रोकने के लिए 17 डॉपलर रडार (DWR), इनसैट-3D उपग्रह और राष्ट्रीय ग्राउंड लाइटनिंग नेटवर्क द्वारा संचालित वास्तविक समय 0 से 3 घंटे पूर्व चेतावनी पोर्टल।"
                : "A unified AI/ML meteorological nowcasting platform providing 0–3 hour district-level convective storm tracking and lightning warnings, refreshed every 10 minutes on a 2km grid across the Indian subcontinent."}
            </p>

            {/* Action Buttons styled to e-Samanvit standard */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <button
                onClick={onGoToDashboard}
                className="btn btn-primary"
                style={{ padding: "12px 24px", fontSize: "14px" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                <span>{lang === "hi" ? "लाइव मैप डैशबोर्ड खोलें" : "Launch Live Radar Dashboard"}</span>
              </button>

              <button
                onClick={onGoToAbout}
                className="btn btn-secondary"
                style={{ padding: "12px 22px", fontSize: "14px" }}
              >
                <span>{lang === "hi" ? "मिशन एवं तकनीकी विवरण" : "Technical Architecture & Mission"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── National Tricolor Accent Strip ─────────────────────────── */}
      <div className="tricolor-bar" />

      {/* ── 2. Live National Telemetry Ribbon (e-Samanvit Stat Cards) ── */}
      <section style={{ maxWidth: "1160px", margin: "28px auto 0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {/* Card 1: Active Convective Cells */}
          <div className="card card-hover" style={{ padding: "20px", borderLeft: "4px solid var(--alert-orange)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--clr-gray-500)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {lang === "hi" ? "सक्रिय तूफान सेल" : "Active Convective Cells"}
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--clr-gray-900)", margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{activeStormsCount}</span>
              <span className="badge-orange" style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
                ORANGE ALERT
              </span>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--clr-gray-600)" }}>
              Kolkata, Odisha, Vidarbha, Kamrup
            </div>
          </div>

          {/* Card 2: Atmospheric Instability (CAPE) */}
          <div className="card card-hover" style={{ padding: "20px", borderLeft: "4px solid var(--alert-red)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--clr-gray-500)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {lang === "hi" ? "वायुमंडलीय अस्थिरता (CAPE)" : "Atmospheric Instability"}
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--clr-gray-900)", margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{highCapeStations.length > 0 ? `${highCapeStations[0].cape} J/kg` : "2,350 J/kg"}</span>
              <span className="badge-red" style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
                HIGH ENERGY
              </span>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--clr-gray-600)" }}>
              Severe thunderstorm & lightning risk
            </div>
          </div>

          {/* Card 3: IMD Radar Network */}
          <div className="card card-hover" style={{ padding: "20px", borderLeft: "4px solid var(--clr-primary-700)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--clr-gray-500)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {lang === "hi" ? "IMD डॉपलर रडार नेटवर्क" : "IMD Radar Network"}
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--clr-gray-900)", margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>17 / 17</span>
              <span className="badge-green" style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
                ONLINE
              </span>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--clr-gray-600)" }}>
              Dual-Polarization S, C, X-Band
            </div>
          </div>

          {/* Card 4: Nowcast Refresh Rate */}
          <div className="card card-hover" style={{ padding: "20px", borderLeft: "4px solid var(--clr-accent-700)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--clr-gray-500)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {lang === "hi" ? "पूर्वानुमान अद्यतन चक्र" : "Nowcast Refresh Rate"}
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--clr-gray-900)", margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>10 Min</span>
              <span className="badge-gold" style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
                ~2km GRID
              </span>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--clr-gray-600)" }}>
              Cross-Attention Deep Learning
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Four Pillars of Multi-Sensor Fusion ──────────────────── */}
      <section style={{ maxWidth: "1160px", margin: "0 auto", padding: "48px 24px 24px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--clr-primary-800)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              backgroundColor: "var(--clr-primary-100)",
              padding: "4px 14px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--clr-primary-200)",
            }}
          >
            {lang === "hi" ? "चार मुख्य डेटा स्तंभ" : "Multi-Modal Architecture"}
          </span>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--clr-gray-900)", margin: "10px 0 6px 0" }}>
            {lang === "hi"
              ? "मल्टी-सेंसर डेटा फ्यूजन एवं डीप लर्निंग पाइपलाइन"
              : "Four Pillars of Atmospheric Sensor Fusion"}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--clr-gray-600)", maxWidth: "700px", margin: "0 auto", lineHeight: 1.6 }}>
            {lang === "hi"
              ? "पारंपरिक संख्यात्मक मॉडल (NWP) चलने में 3–6 घंटे लगाते हैं। Minutes Ahead चार अलग-अलग उपग्रह और रडार स्रोतों को मिलाकर 10 मिनट में परिणाम देता है।"
              : "Integrating heterogeneous atmospheric datasets to eliminate single-sensor blind spots and achieve accurate 0–3h convective initiation."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          {/* Pillar 1: Doppler Radars */}
          <div className="card card-hover" style={{ padding: "24px" }}>
            <div className="card-icon card-icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
              </svg>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--clr-gray-900)", margin: "0 0 8px 0" }}>
              {lang === "hi" ? "17 डॉपलर मौसम रडार (DWR)" : "17 Doppler Radars (DWR)"}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--clr-gray-600)", lineHeight: 1.6, margin: 0 }}>
              {lang === "hi"
                ? "3D रिफ्लेक्टिविटी क्यूब्स (Z, ZDR, KDP) जो बादलों के अंदर मौजूद भारी वर्षा, ओलावृष्टि और तूफानी चक्रवातों को 250 किमी दायरे में मापते हैं।"
                : "Volume scans producing 3D reflectivity cubes (Z, ZDR, KDP) detecting intense precipitation cores and hail up to 250km."}
            </p>
            <div style={{ marginTop: "14px", fontSize: "11px", fontWeight: 700, color: "var(--clr-primary-700)" }}>
              S-Band & C-Band Mosaics
            </div>
          </div>

          {/* Pillar 2: INSAT Satellite */}
          <div className="card card-hover" style={{ padding: "24px" }}>
            <div className="card-icon card-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <ellipse cx="12" cy="12" rx="9" ry="4" />
                <path d="M12 3v18" />
              </svg>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--clr-gray-900)", margin: "0 0 8px 0" }}>
              {lang === "hi" ? "इनसैट-3D/3DR उपग्रह" : "INSAT-3D / 3DR Satellite"}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--clr-gray-600)", lineHeight: 1.6, margin: 0 }}>
              {lang === "hi"
                ? "थर्मल इन्फ्रारेड (TIR-1 10.8 µm) द्वारा बादलों के शीर्ष के तीव्र शीतलन दर (-2°C / 10 मिनट) की पहचान, जो आंधी के जन्म का पहला संकेत है।"
                : "Thermal IR (10.8 µm) rapid cloud-top cooling rates (> -2°C/10 min) identifying explosive updraft plumes before rain reaches the ground."}
            </p>
            <div style={{ marginTop: "14px", fontSize: "11px", fontWeight: 700, color: "var(--alert-info)" }}>
              Geostationary Rapid Scan
            </div>
          </div>

          {/* Pillar 3: Lightning Network */}
          <div className="card card-hover" style={{ padding: "24px" }}>
            <div className="card-icon card-icon-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--clr-gray-900)", margin: "0 0 8px 0" }}>
              {lang === "hi" ? "ग्राउंड लाइटनिंग नेटवर्क" : "Lightning Network (LLDN)"}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--clr-gray-600)", lineHeight: 1.6, margin: 0 }}>
              {lang === "hi"
                ? "क्लाउड-टू-ग्राउंड और इंट्रा-क्लाउड बिजली के स्ट्रोक की घनत्व गणना, जो भारी बारिश आने से 15-30 मिनट पहले तीव्र संकेत प्रदान करती है।"
                : "Total lightning detection providing instantaneous stroke cluster centroids and 15–30 min lead time before intense downpour onset."}
            </p>
            <div style={{ marginTop: "14px", fontSize: "11px", fontWeight: 700, color: "var(--clr-accent-700)" }}>
              15–30 Min Pre-Rain Lead Time
            </div>
          </div>

          {/* Pillar 4: Thermodynamic CAPE */}
          <div className="card card-hover" style={{ padding: "24px" }}>
            <div className="card-icon card-icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--clr-gray-900)", margin: "0 0 8px 0" }}>
              {lang === "hi" ? "NWP अस्थिरता इंडेक्स (CAPE/LI)" : "NWP Thermodynamic CAPE"}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--clr-gray-600)", lineHeight: 1.6, margin: 0 }}>
              {lang === "hi"
                ? "वायुमंडलीय उपलब्ध ऊर्जा (CAPE > 1500 J/kg) और लिफ्टेड इंडेक्स (LI < -3) जो विस्फोटक थंडरस्टॉर्म बनने की अनुकूलता दर्शाते हैं।"
                : "Convective Available Potential Energy (CAPE) and Lifted Index from WRF soundings assessing buoyancy and explosive updraft potential."}
            </p>
            <div style={{ marginTop: "14px", fontSize: "11px", fontWeight: 700, color: "var(--clr-primary-700)" }}>
              CAPE & Wind Shear Soundings
            </div>
          </div>
        </div>
      </section>

      {/* ── 3B. End-to-End Convective Nowcasting Workflow ──────────── */}
      <section style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px 32px 24px" }}>
        <div
          className="card"
          style={{
            padding: "28px",
            border: "1.5px solid var(--clr-primary-200)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Section Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "22px" }}>
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--clr-primary-800)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  backgroundColor: "var(--clr-primary-100)",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--clr-primary-200)",
                }}
              >
                {lang === "hi" ? "कार्यप्रणाली एवं वायुमंडलीय विश्लेषण" : "AI Nowcasting Workflow"}
              </span>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--clr-gray-900)", margin: "8px 0 4px 0" }}>
                {lang === "hi"
                  ? "डेटा स्रोत से त्वरित चेतावनी: संपूर्ण 6-चरणीय प्रक्रिया"
                  : "From Heterogeneous Data to Early Warning: End-to-End Pipeline"}
              </h2>
              <p style={{ fontSize: "13px", color: "var(--clr-gray-600)", margin: 0 }}>
                {lang === "hi"
                  ? "प्रत्येक 10 मिनट में रडार, उपग्रह और ग्राउंड सेंसर से वायुमंडलीय मापदंडों का विश्लेषण कर जोखिम क्षेत्र और एआई आत्मविश्वास तैयार होता है।"
                  : "Continuous 10-minute assimilation pipeline transforming multi-sensor observations into localized risk zones and verified lead-time alerts."}
              </p>
            </div>
            <button
              onClick={onGoToDashboard}
              className="btn btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              {lang === "hi" ? "लाइव मैप पर जोखिम क्षेत्र देखें →" : "View Live Risk Zones on Map →"}
            </button>
          </div>

          {/* 6-Step Visual Workflow Ribbon (e-Samanvit Journey Flow Style) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
              padding: "14px 16px",
              backgroundColor: "var(--clr-primary-50)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--clr-primary-200)",
              marginBottom: "24px",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            {[
              { step: "1", title: "Data Sources", subtitle: "Radar, Satellite, AWS, NWP" },
              { step: "2", title: "Atmospheric Telemetry", subtitle: "9 Sounding Metrics" },
              { step: "3", title: "AI Analysis", subtitle: "Cross-Attention Fusion" },
              { step: "4", title: "Risk Zone", subtitle: "Geographic Contours" },
              { step: "5", title: "Prediction Confidence", subtitle: "Calibrated Probabilities" },
              { step: "6", title: "Early Warning", subtitle: "0–3h Minutes Ahead" },
            ].map((node, i) => (
              <div key={node.step} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: i === 4 ? "var(--clr-accent-700)" : "var(--clr-primary-800)",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {node.step}
                  </span>
                  <div>
                    <div style={{ color: "var(--clr-gray-900)", fontSize: "11.5px" }}>{node.title}</div>
                    <div style={{ color: "var(--clr-gray-600)", fontSize: "9.5px", fontWeight: 500 }}>{node.subtitle}</div>
                  </div>
                </div>
                {i < 5 && (
                  <span style={{ color: "var(--clr-primary-600)", fontSize: "14px", margin: "0 4px", fontWeight: 800 }}>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Side-by-Side Intelligence Suite: Atmospheric Parameters & AI Confidence */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "20px" }}>
            {/* Left Card: Atmospheric Conditions Overview */}
            <div
              className="card"
              style={{
                padding: "18px",
                border: "1px solid var(--clr-primary-200)",
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🌡️</span>
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--clr-gray-900)", textTransform: "uppercase" }}>
                      Atmospheric Conditions
                    </div>
                    <div style={{ fontSize: "10.5px", color: "var(--clr-gray-600)" }}>
                      Key Synoptic Telemetry Parameters
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "var(--radius-full)", backgroundColor: "var(--alert-yellow-bg)", color: "var(--alert-yellow)", fontWeight: 800 }}>
                  DEMO / SIMULATED DATA
                </span>
              </div>

              {/* Explanatory callout */}
              <div
                style={{
                  backgroundColor: "var(--alert-yellow-bg)",
                  border: "1px solid var(--alert-yellow-bdr)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                  fontSize: "11px",
                }}
              >
                <div style={{ fontWeight: 800, color: "var(--alert-yellow)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
                  <span>⚠️</span>
                  <span>Why is a storm likely?</span>
                </div>
                <p style={{ color: "#78350F", margin: 0, lineHeight: 1.5, fontSize: "11px" }}>
                  High atmospheric instability, increasing moisture and strong wind shear indicate favorable conditions for thunderstorm development.
                </p>
              </div>

              {/* 6 Key Atmospheric Parameter Cards Preview */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {CURRENT_ATMOSPHERIC_CONDITIONS.slice(0, 6).map((p) => {
                  const isSevere = p.status === "severe";
                  const isElevated = p.status === "elevated";
                  const valColor = isSevere ? "var(--alert-red)" : isElevated ? "var(--alert-orange)" : "var(--clr-gray-900)";

                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--clr-gray-50)",
                        border: isSevere ? "1px solid var(--alert-red-bdr)" : "1px solid var(--clr-gray-200)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--clr-gray-600)" }}>{p.name}</span>
                        <span
                          style={{
                            fontSize: "8.5px",
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: p.trend === "rising" ? "var(--alert-red-bg)" : "var(--clr-primary-100)",
                            color: p.trend === "rising" ? "var(--alert-red)" : "var(--clr-primary-800)",
                          }}
                        >
                          {p.trend === "rising" ? "↑" : p.trend === "falling" ? "↓" : "→"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginTop: "2px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: valColor }}>{p.value}</span>
                        <span style={{ fontSize: "9.5px", color: "var(--clr-gray-500)" }}>{p.unit}</span>
                      </div>
                      {/* Visual Meter */}
                      <div style={{ height: "3px", width: "100%", backgroundColor: "var(--clr-gray-200)", borderRadius: "var(--radius-full)", marginTop: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${p.percent}%`,
                            backgroundColor: isSevere ? "var(--alert-red)" : isElevated ? "var(--alert-orange)" : "var(--clr-primary-700)",
                            borderRadius: "var(--radius-full)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                <span style={{ fontSize: "10px", color: "var(--clr-gray-500)" }}>
                  All 9 Parameters visible in Map Dashboard Left Panel
                </span>
                <button
                  onClick={onGoToDashboard}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--clr-primary-800)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Inspect All Parameters →
                </button>
              </div>
            </div>

            {/* Right Card: AI Prediction Confidence Gauge Suite */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <AIPredictionConfidence
                thunderstormProb={82}
                lightningProb={74}
                aiConfidence={91}
                locationName="Subcontinent Convective Basin"
                isCompact={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Live Observatory Stations Weather Feed ───────────────── */}
      <section style={{ maxWidth: "1160px", margin: "0 auto", padding: "12px 24px 44px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--clr-primary-800)",
                textTransform: "uppercase",
                backgroundColor: "var(--clr-primary-100)",
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--clr-primary-200)",
              }}
            >
              {lang === "hi" ? "लाइव वेधशाला आंकड़े" : "Real-Time Telemetry"}
            </span>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--clr-gray-900)", margin: "6px 0 0 0" }}>
              {lang === "hi" ? "भारत के प्रमुख वेधशाला स्टेशनों की स्थिति" : "Live Observatory Stations Across India"}
            </h2>
          </div>
          <button
            onClick={onGoToDashboard}
            className="btn btn-secondary"
            style={{ padding: "8px 16px", fontSize: "12px" }}
          >
            {lang === "hi" ? "मैप पर सभी 30+ स्टेशन देखें →" : "View All 30+ Stations on Map →"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {displayStations.map((st) => {
            const isHighRisk = st.cape >= 1500;
            return (
              <div
                key={st.stationId}
                className="card card-hover"
                style={{
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderLeft: isHighRisk ? "4px solid var(--alert-red)" : "4px solid var(--clr-primary-700)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "14.5px", fontWeight: 800, color: "var(--clr-gray-900)" }}>{st.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--clr-gray-600)" }}>
                        {st.state} · {st.lat.toFixed(1)}°N, {st.lon.toFixed(1)}°E
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: isHighRisk ? "var(--alert-red-bg)" : "var(--clr-primary-100)",
                        color: isHighRisk ? "var(--alert-red)" : "var(--clr-primary-800)",
                        border: isHighRisk ? "1px solid var(--alert-red-bdr)" : "1px solid var(--clr-primary-200)",
                      }}
                    >
                      {st.riskLabel}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "12px" }}>
                    <div style={{ backgroundColor: "var(--clr-gray-50)", padding: "8px", borderRadius: "var(--radius-md)", textAlign: "center", border: "1px solid var(--clr-gray-200)" }}>
                      <span style={{ fontSize: "10px", color: "var(--clr-gray-500)", display: "block" }}>TEMP</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--clr-gray-900)" }}>{st.temp}°C</span>
                    </div>
                    <div style={{ backgroundColor: "var(--clr-gray-50)", padding: "8px", borderRadius: "var(--radius-md)", textAlign: "center", border: "1px solid var(--clr-gray-200)" }}>
                      <span style={{ fontSize: "10px", color: "var(--clr-gray-500)", display: "block" }}>CAPE</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: isHighRisk ? "var(--alert-red)" : "var(--clr-gray-900)" }}>
                        {st.cape}
                      </span>
                    </div>
                    <div style={{ backgroundColor: "var(--clr-gray-50)", padding: "8px", borderRadius: "var(--radius-md)", textAlign: "center", border: "1px solid var(--clr-gray-200)" }}>
                      <span style={{ fontSize: "10px", color: "var(--clr-gray-500)", display: "block" }}>WIND</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--clr-gray-900)" }}>{st.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onGoToDashboard}
                  style={{
                    marginTop: "14px",
                    width: "100%",
                    padding: "7px 0",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--clr-primary-50)",
                    color: "var(--clr-primary-800)",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    border: "1px solid var(--clr-primary-200)",
                    cursor: "pointer",
                    transition: "all var(--duration-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--clr-primary-100)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--clr-primary-50)";
                  }}
                >
                  {lang === "hi" ? "मैप पर रडार देखें →" : "Inspect on Radar Map →"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. e-Samanvit Official Evergreen Footer ─────────────────── */}
      <Footer
        onGoToHome={() => {
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        onGoToNowcast={onGoToDashboard}
        onGoToSafety={onGoToSafety}
        onGoToAbout={onGoToAbout}
        lang={lang}
      />
    </div>
  );
}
