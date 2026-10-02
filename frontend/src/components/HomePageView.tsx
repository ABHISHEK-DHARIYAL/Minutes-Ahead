"use client";
import Image from "next/image";
import type { NowcastData } from "@/app/page";
import { LiveWeatherData } from "@/data/indiaData";

interface HomePageViewProps {
  onGoToDashboard: () => void;
  onGoToAbout: () => void;
  nowcast: NowcastData | null;
  weatherData: LiveWeatherData[];
  lang: "en" | "hi";
}

export default function HomePageView({
  onGoToDashboard,
  onGoToAbout,
  nowcast,
  weatherData,
  lang,
}: HomePageViewProps) {
  const activeStormsCount = nowcast?.storm_cards.length ?? 4;
  const highCapeStations = weatherData.filter((s) => s.cape >= 1800);

  return (
    <div style={{ width: "100%", flex: 1, overflowY: "auto", backgroundColor: "#F8FAFC" }}>
      {/* ── 1. Hero Banner (e-Samanvit Master Style) ───────────────── */}
      <section
        style={{
          width: "100%",
          borderBottom: "1px solid #B8E0B9",
          padding: "48px 24px",
          background: "linear-gradient(180deg, #EDF7EE 0%, #F5FAF6 50%, #EAF4EB 100%)",
          boxShadow: "0 4px 20px rgba(46, 125, 50, 0.06)",
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "40px",
            justifyContent: "space-between",
          }}
        >
          {/* Logo Card */}
          <div
            style={{
              width: "220px",
              height: "220px",
              borderRadius: "20px",
              backgroundColor: "#ffffff",
              border: "2px solid #C8E6C9",
              boxShadow: "0 4px 24px rgba(46, 125, 50, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Image
              src="/logo.png"
              alt="Minutes Ahead Logo"
              width={188}
              height={188}
              style={{ objectFit: "contain", borderRadius: "12px" }}
              priority
            />
            <span
              style={{
                position: "absolute",
                bottom: "10px",
                backgroundColor: "#2E7D32",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 800,
                padding: "2px 10px",
                borderRadius: "9999px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              0–3h NOWCAST
            </span>
          </div>

          {/* Hero Text */}
          <div style={{ flex: 1, minWidth: "320px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                borderRadius: "9999px",
                backgroundColor: "#E8F5E9",
                border: "1px solid #C8E6C9",
                color: "#2E7D32",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              <span>🇮🇳</span>
              <span>
                {lang === "hi"
                  ? "पृथ्वी विज्ञान मंत्रालय · भारतीय मौसम विभाग (IMD)"
                  : "Ministry of Earth Sciences · India Meteorological Department"}
              </span>
            </div>

            <h1
              style={{
                fontSize: "36px",
                fontWeight: 900,
                color: "#1B5E20",
                letterSpacing: "-0.02em",
                margin: "0 0 6px 0",
              }}
            >
              Minutes Ahead
            </h1>

            <p style={{ fontSize: "17px", fontWeight: 700, color: "#2E7D32", margin: "0 0 12px 0" }}>
              {lang === "hi"
                ? "आंधी-तूफान एवं आकाशीय बिजली (वज्रपात) की सटीक तात्कालिक चेतावनी प्रणाली"
                : "AI/ML-Based High-Resolution Nowcasting of Thunderstorms & Lightning"}
            </p>

            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: "0 0 24px 0", maxWidth: "640px" }}>
              {lang === "hi"
                ? "मौसम रडार (DWR), इनसैट-3D उपग्रह, ग्राउंड लाइटनिंग डिटेक्टर्स और एनडब्ल्यूपी मॉडल डेटा के संयोजन द्वारा भारत के हर जिले के लिए 0 से 3 घंटे पूर्व तीव्र चेतावनी।"
                : "Operational early warnings refreshed every 10 minutes at ~2km spatial grid. Integrating multiple Doppler radars, INSAT-3D/3DR satellite cooling, lightning ground strikes, and convective instability to protect lives and agriculture across India."}
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <button
                onClick={onGoToDashboard}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  backgroundColor: "#2E7D32",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(46, 125, 50, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background 0.15s ease",
                }}
              >
                <span>🗺️</span>
                <span>{lang === "hi" ? "लाइव मैप डैशबोर्ड खोलें" : "Launch Live Radar Dashboard"}</span>
                <span>→</span>
              </button>

              <button
                onClick={onGoToAbout}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  color: "#0F172A",
                  fontWeight: 700,
                  fontSize: "13px",
                  border: "1px solid #CBD5E1",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>📖</span>
                <span>{lang === "hi" ? "तकनीकी विवरण जानें" : "Architecture & Mission"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Live National Telemetry Ribbon (4 Cards) ────────────── */}
      <section style={{ maxWidth: "1160px", margin: "-28px auto 0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
          {/* Card 1 */}
          <div className="esam-card" style={{ padding: "16px 20px", borderLeft: "4px solid #EA580C" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              {lang === "hi" ? "सक्रिय तूफान सेल" : "Active Convective Cells"}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚡ {activeStormsCount}</span>
              <span className="badge-orange" style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                ORANGE ALERT
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748B" }}>
              West Bengal, Odisha, Vidarbha
            </div>
          </div>

          {/* Card 2 */}
          <div className="esam-card" style={{ padding: "16px 20px", borderLeft: "4px solid #DC2626" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              {lang === "hi" ? "अत्यधिक अस्थिरता (CAPE)" : "Peak Atmospheric Energy"}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{highCapeStations.length > 0 ? `${highCapeStations[0].cape} J/kg` : "2,300 J/kg"}</span>
              <span className="badge-red" style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                HIGH RISK
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748B" }}>
              Severe thunderstorm potential
            </div>
          </div>

          {/* Card 3 */}
          <div className="esam-card" style={{ padding: "16px 20px", borderLeft: "4px solid #16A34A" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              {lang === "hi" ? "IMD डॉपलर रडार नेटवर्क" : "IMD Radar Network"}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>17 / 17</span>
              <span className="badge-green" style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                ONLINE
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748B" }}>
              S, C, X-Band Surveillance Cones
            </div>
          </div>

          {/* Card 4 */}
          <div className="esam-card" style={{ padding: "16px 20px", borderLeft: "4px solid #2563EB" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              {lang === "hi" ? "मॉडल अपडेट अंतराल" : "Nowcast Refresh Rate"}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>10 Min</span>
              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, backgroundColor: "#DBEAFE", color: "#1D4ED8" }}>
                ~2km GRID
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748B" }}>
              Cross-Attention Deep Learning
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Core Capability Modules (e-Samanvit Service Cards) ─── */}
      <section style={{ maxWidth: "1160px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#2E7D32",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              backgroundColor: "#E8F5E9",
              padding: "4px 14px",
              borderRadius: "9999px",
              border: "1px solid #C8E6C9",
            }}
          >
            {lang === "hi" ? "प्रमुख तकनीकी क्षमताएं" : "System Capabilities"}
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0F2744", margin: "10px 0 0 0" }}>
            {lang === "hi"
              ? "मौसम विभाग के लिए अगली पीढ़ी की तात्कालिक तकनीक"
              : "Next-Generation Atmospheric Early Warning Architecture"}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {/* Module 1 */}
          <div className="esam-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#E8F5E9",
                  color: "#2E7D32",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "16px",
                  border: "1px solid #C8E6C9",
                }}
              >
                📡
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F2744", margin: "0 0 8px 0" }}>
                {lang === "hi" ? "मल्टी-सेंसर डेटा फ्यूजन" : "Multi-Sensor Observation Fusion"}
              </h3>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                {lang === "hi"
                  ? "विभिन्न डॉपलर रडारों की स्कैनिंग विसंगतियों को दूर कर 3D मोजेक तैयार करना और इनसैट-3D उपग्रह के क्लाउड-टॉप तापमान से जोड़ना।"
                  : "QC de-aliasing and 3D mosaicing across heterogeneous radar scans (Delhi, Kolkata, Mumbai, Chennai) combined with INSAT-3D rapid cloud-top cooling."}
              </p>
            </div>
            <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #F1F5F9", fontSize: "11px", fontWeight: 700, color: "#2E7D32" }}>
              Doppler Radars + INSAT-3D + Ground Lightning
            </div>
          </div>

          {/* Module 2 */}
          <div className="esam-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#F0FDF4",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "16px",
                  border: "1px solid #BBF7D0",
                }}
              >
                🧠
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F2744", margin: "0 0 8px 0" }}>
                {lang === "hi" ? "कन्वेक्टिव इनिशिएशन एवं डीप लर्निंग" : "Deep Convective Initiation"}
              </h3>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                {lang === "hi"
                  ? "साधारण ऑप्टिकल फ्लो केवल तूफान को आगे खिसकाता है; हमारा मॉडल तूफान के जन्म, तीव्रता और खात्मे का सटीक पूर्वानुमान लगाता है।"
                  : "ConvLSTM with cross-attention predicts storm birth, explosive vertical growth, and dissipation where traditional extrapolation techniques fail."}
              </p>
            </div>
            <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #F1F5F9", fontSize: "11px", fontWeight: 700, color: "#16A34A" }}>
              ConvLSTM + Cross-Attention + Physics Baseline
            </div>
          </div>

          {/* Module 3 */}
          <div className="esam-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#EFF6FF",
                  color: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "16px",
                  border: "1px solid #BFDBFE",
                }}
              >
                📢
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F2744", margin: "0 0 8px 0" }}>
                {lang === "hi" ? "जिला-स्तरीय स्वतः चेतावनी (CAP)" : "Automated District Warnings"}
              </h3>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                {lang === "hi"
                  ? "NDMA और SDMA के लिए आधिकारिक CAP v1.2 प्रोटोकॉल संदेश और नागरिकों व किसानों के लिए स्थानीय भाषा में एसएमएस/व्हाट्सएप अलर्ट।"
                  : "Dispatches automated Common Alerting Protocol (CAP v1.2) XML/JSON feeds to state disaster management authorities with district ETA and impact severity."}
              </p>
            </div>
            <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #F1F5F9", fontSize: "11px", fontWeight: 700, color: "#2563EB" }}>
              CAP v1.2 + Multi-Lingual SMS/WhatsApp Alerts
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Farmer & Citizen 30-30 Safety Rule Banner ──────────── */}
      <section style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px 60px 24px" }}>
        <div
          className="esam-card"
          style={{
            padding: "24px 28px",
            backgroundColor: "#FFFBEB",
            border: "1.5px solid #FCD34D",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", maxWidth: "800px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#F59E0B",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ⚡
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#78350F", margin: "0 0 4px 0" }}>
                {lang === "hi" ? "नागरिकों और किसानों के लिए 30-30 का जीवन रक्षा नियम" : "The 30-30 Lightning Life Safety Rule"}
              </h3>
              <p style={{ fontSize: "13px", color: "#92400E", lineHeight: 1.6, margin: 0 }}>
                {lang === "hi"
                  ? "यदि बिजली चमकने और गड़गड़ाहट के बीच 30 सेकंड से कम समय हो, तो तुरंत पक्के आश्रय में जाएं। अंतिम गड़गड़ाहट के बाद 30 मिनट तक बाहर न निकलें। खुले खेतों में काम तुरंत बंद करें और ऊंचे पेड़ों से दूर रहें।"
                  : "If the time between seeing lightning and hearing thunder is less than 30 seconds, the storm is within 10km — seek enclosed shelter immediately. Wait at least 30 minutes after the last thunder before resuming outdoor work."}
              </p>
            </div>
          </div>
          <button
            onClick={onGoToDashboard}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "#D97706",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(217, 119, 6, 0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {lang === "hi" ? "लाइव रडार मैप देखें" : "View Live Warnings"}
          </button>
        </div>
      </section>
    </div>
  );
}
