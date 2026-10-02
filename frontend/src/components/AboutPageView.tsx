"use client";
import Image from "next/image";

interface AboutPageViewProps {
  onGoToDashboard: () => void;
  lang: "en" | "hi";
}

export default function AboutPageView({ onGoToDashboard, lang }: AboutPageViewProps) {
  return (
    <div style={{ width: "100%", flex: 1, overflowY: "auto", backgroundColor: "#F8FAFC", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <Image
            src="/logo.png"
            alt="Minutes Ahead"
            width={64}
            height={64}
            style={{ borderRadius: "50%", border: "2px solid #C8E6C9", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          />
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#1B5E20", margin: 0 }}>
              {lang === "hi" ? "परियोजना परिचय एवं तकनीकी विवरण" : "About Minutes Ahead"}
            </h1>
            <p style={{ fontSize: "13px", color: "#475569", fontWeight: 600, margin: "4px 0 0 0" }}>
              Ministry of Earth Sciences / India Meteorological Department (IMD) · Smart India Hackathon
            </p>
          </div>
        </div>

        {/* 1. The Core Problem Statement */}
        <div className="esam-card" style={{ padding: "28px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#2E7D32",
              textTransform: "uppercase",
              backgroundColor: "#E8F5E9",
              padding: "4px 12px",
              borderRadius: "9999px",
              border: "1px solid #C8E6C9",
            }}
          >
            {lang === "hi" ? "समस्या कथन (Problem Statement)" : "The National Problem Statement"}
          </span>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0F2744", margin: "14px 0 8px 0" }}>
            "AI/ML based Nowcasting of thunderstorm and lightning using atmospheric observations including multiple radars, satellite, lightning and model data."
          </h2>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.7, margin: 0 }}>
            {lang === "hi"
              ? "भारत में हर साल आकाशीय बिजली गिरने से 2,500 से अधिक लोगों की जान जाती है, विशेषकर खेतों में काम करने वाले किसान और ग्रामीण नागरिक। पारंपरिक संख्यात्मक मौसम मॉडल (NWP) को चलने में 3 से 6 घंटे लगते हैं और उनका ग्रिड 9 से 12 किमी होता है। आंधी-तूफान 20-30 मिनट में पैदा होते हैं, इसलिए उनके लिए 0 से 3 घंटे का तात्कालिक पूर्वानुमान (Nowcasting) अति-आवश्यक है।"
              : "In India, convective thunderstorms and lightning strikes claim thousands of lives annually—particularly farmers, rural workers, and vulnerable communities during pre-monsoon nor'westers (Kalbaishakhi) and monsoon spells. Traditional Numerical Weather Prediction (NWP) models are too slow (3–6 hours execution latency) and coarse (~9–12km resolution) for convective cells that develop, intensify, and dissipate in 20–45 minutes."}
          </p>
        </div>

        {/* 2. Why Simple Optical Flow Fails & How We Solve It */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          <div className="esam-card" style={{ padding: "24px", borderLeft: "4px solid #DC2626" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#991B1B", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚠️</span>
              <span>{lang === "hi" ? "पारंपरिक तरीकों की सीमाएं" : "Why Traditional Extrapolation Fails"}</span>
            </h3>
            <ul style={{ fontSize: "12px", color: "#475569", lineHeight: 1.7, paddingLeft: "18px", margin: 0 }}>
              <li>
                <strong>Storm Initiation:</strong> Radar extrapolation cannot predict storm birth before echo appears.
              </li>
              <li>
                <strong>Rapid Growth & Decay:</strong> Linear optical flow merely moves existing rain clouds forward; it cannot model explosive updrafts or sudden collapse.
              </li>
              <li>
                <strong>Single Radar Blind Spots:</strong> Different radar scan angles, beam blockage in hills, and non-overlapping surveillance.
              </li>
            </ul>
          </div>

          <div className="esam-card" style={{ padding: "24px", borderLeft: "4px solid #16A34A" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#166534", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚡</span>
              <span>{lang === "hi" ? "'Minutes Ahead' का समाधान" : "How 'Minutes Ahead' Solves It"}</span>
            </h3>
            <ul style={{ fontSize: "12px", color: "#475569", lineHeight: 1.7, paddingLeft: "18px", margin: 0 }}>
              <li>
                <strong>Cross-Attention Multi-Modal Fusion:</strong> Fuses Doppler Radar reflectivity, INSAT-3D rapid cloud cooling, and ground lightning sensors.
              </li>
              <li>
                <strong>Physics-Informed Instability:</strong> Uses real CAPE (Convective Available Potential Energy) and Lifted Index to forecast storm growth.
              </li>
              <li>
                <strong>Sub-Minute Latency:</strong> Generates district-level early warnings in &lt;45 seconds across a 2km spatial grid.
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Multi-Sensor Data Ingestion Pipeline */}
        <div className="esam-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F2744", margin: "0 0 18px 0" }}>
            {lang === "hi" ? "चार प्रमुख मौसम डेटा स्रोत (Multi-Sensor Architecture)" : "Four Multi-Modal Observation Pillars"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>📡</div>
              <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>Doppler Weather Radars</div>
              <div style={{ color: "#64748B", fontSize: "11px", marginTop: "4px", lineHeight: 1.5 }}>
                IMD S, C, X-Band networks. QC de-aliasing, attenuation correction, and 3D composite mosaic.
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>🛰️</div>
              <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>INSAT-3D / 3DR Satellite</div>
              <div style={{ color: "#64748B", fontSize: "11px", marginTop: "4px", lineHeight: 1.5 }}>
                TIR-1 Brightness Temperature, rapid cloud-top cooling rates (precursor to convective initiation).
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>⚡</div>
              <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>Ground Lightning Sensors</div>
              <div style={{ color: "#64748B", fontSize: "11px", marginTop: "4px", lineHeight: 1.5 }}>
                IITM Damini / Blitzortung ground strikes. Detects charge separation and active stroke clusters.
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>🌀</div>
              <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "13px" }}>NWP Convective Indices</div>
              <div style={{ color: "#64748B", fontSize: "11px", marginTop: "4px", lineHeight: 1.5 }}>
                NCMRWF / GFS CAPE, CIN, Lifted Index, and 0–6km vertical wind shear boundary conditions.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Accuracy Verification Benchmarks */}
        <div className="esam-card" style={{ padding: "24px", backgroundColor: "#F0FDF4", border: "1.5px solid #C8E6C9" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#166534", margin: "0 0 14px 0" }}>
            {lang === "hi" ? "मॉडल सत्यापन स्कोर (Operational Evaluation Scores)" : "Model Verification Metrics (Withheld Test Events)"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", textAlign: "center" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #C8E6C9" }}>
              <div style={{ fontSize: "11px", color: "#64748B" }}>CSI @ 35 dBZ</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "#2E7D32", marginTop: "2px" }}>0.42</div>
              <div style={{ fontSize: "10px", color: "#64748B" }}>Baseline: 0.15</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #C8E6C9" }}>
              <div style={{ fontSize: "11px", color: "#64748B" }}>POD (Detection)</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "#2E7D32", marginTop: "2px" }}>0.76</div>
              <div style={{ fontSize: "10px", color: "#64748B" }}>Baseline: 0.45</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #C8E6C9" }}>
              <div style={{ fontSize: "11px", color: "#64748B" }}>FAR (False Alarm)</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "#B91C1C", marginTop: "2px" }}>0.31</div>
              <div style={{ fontSize: "10px", color: "#64748B" }}>Baseline: 0.60</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #C8E6C9" }}>
              <div style={{ fontSize: "11px", color: "#64748B" }}>Pipeline Latency</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "#2E7D32", marginTop: "2px" }}>&lt;45s</div>
              <div style={{ fontSize: "10px", color: "#64748B" }}>End-to-End Alert</div>
            </div>
          </div>
        </div>

        {/* Launch Dashboard CTA */}
        <div style={{ textAlign: "center", padding: "12px 0 40px 0" }}>
          <button
            onClick={onGoToDashboard}
            style={{
              padding: "14px 32px",
              borderRadius: "8px",
              backgroundColor: "#2E7D32",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(46, 125, 50, 0.35)",
            }}
          >
            {lang === "hi" ? "लाइव मैप डैशबोर्ड खोलें →" : "Launch Live Radar Dashboard →"}
          </button>
        </div>
      </div>
    </div>
  );
}
