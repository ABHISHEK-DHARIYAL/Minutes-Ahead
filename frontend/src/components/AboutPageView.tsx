"use client";
import Footer from "@/components/Footer";

interface AboutPageViewProps {
  onGoToDashboard: () => void;
  lang: "en" | "hi";
}

export default function AboutPageView({ onGoToDashboard, lang }: AboutPageViewProps) {
  return (
    <div style={{ width: "100%", flex: 1, overflowY: "auto", backgroundColor: "var(--clr-gray-50)" }}>
      {/* ── Header Banner (e-Samanvit Soft Forest Green Banner) ────── */}
      <section
        style={{
          width: "100%",
          borderBottom: "2px solid var(--clr-primary-200)",
          padding: "40px 24px 34px 24px",
          background: "linear-gradient(180deg, #EDF7EE 0%, #F5FAF6 50%, #EAF4EB 100%)",
          boxShadow: "0 6px 24px rgba(27, 94, 32, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(46, 125, 50, 0.16)",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src="logo.png"
              alt="Minutes Ahead"
              width={56}
              height={56}
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%", clipPath: "circle(49% at 50% 50%)" }}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes("/logo.png")) {
                  target.src = "/logo.png";
                }
              }}
            />
          </div>
          <div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
              <span className="esam-chip">
                Ministry of Earth Sciences · Smart India Hackathon
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.3rem)", fontWeight: 800, color: "var(--clr-primary-900)", margin: 0, lineHeight: 1.2 }}>
              {lang === "hi" ? "परियोजना परिचय एवं तकनीकी विवरण" : "About Minutes Ahead"}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--clr-gray-600)", fontWeight: 600, margin: "4px 0 0 0" }}>
              India Meteorological Department (IMD) Convective Nowcasting Mission
            </p>
          </div>
        </div>
      </section>

      {/* ── National Tricolor Accent Strip ─────────────────────────── */}
      <div className="tricolor-bar" />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "36px 24px 20px 24px", display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* 1. The Core Problem Statement */}
        <div className="card" style={{ padding: "26px", border: "1.5px solid var(--clr-primary-200)" }}>
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
            {lang === "hi" ? "समस्या कथन (Problem Statement)" : "The National Problem Statement"}
          </span>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--clr-gray-900)", margin: "14px 0 8px 0" }}>
            "AI/ML based Nowcasting of thunderstorm and lightning using atmospheric observations including multiple radars, satellite, lightning and model data."
          </h2>
          <p style={{ fontSize: "13px", color: "var(--clr-gray-600)", lineHeight: 1.7, margin: 0 }}>
            {lang === "hi"
              ? "भारत में हर साल आकाशीय बिजली गिरने से 2,500 से अधिक लोगों की जान जाती है, विशेषकर खेतों में काम करने वाले किसान और ग्रामीण नागरिक। पारंपरिक संख्यात्मक मौसम मॉडल (NWP) को चलने में 3 से 6 घंटे लगते हैं और उनका ग्रिड 9 से 12 किमी होता है। आंधी-तूफान 20-30 मिनट में पैदा होते हैं, इसलिए उनके लिए 0 से 3 घंटे का तात्कालिक पूर्वानुमान (Nowcasting) अति-आवश्यक है।"
              : "In India, convective thunderstorms and lightning strikes claim thousands of lives annually—particularly farmers, rural workers, and vulnerable communities during pre-monsoon nor'westers (Kalbaishakhi) and monsoon spells. Traditional Numerical Weather Prediction (NWP) models are too slow (3–6 hours execution latency) and coarse (~9–12km resolution) for convective cells that develop, intensify, and dissipate in 20–45 minutes."}
          </p>
        </div>

        {/* 2. Why Simple Optical Flow Fails & How We Solve It */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          <div className="card" style={{ padding: "24px", borderLeft: "4px solid var(--alert-red)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--alert-red)", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{lang === "hi" ? "पारंपरिक तरीकों की सीमाएं" : "Why Traditional Extrapolation Fails"}</span>
            </h3>
            <ul style={{ fontSize: "12.5px", color: "var(--clr-gray-700)", lineHeight: 1.7, paddingLeft: "18px", margin: 0 }}>
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

          <div className="card" style={{ padding: "24px", borderLeft: "4px solid var(--clr-primary-700)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--clr-primary-800)", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>{lang === "hi" ? "'Minutes Ahead' का समाधान" : "How 'Minutes Ahead' Solves It"}</span>
            </h3>
            <ul style={{ fontSize: "12.5px", color: "var(--clr-gray-700)", lineHeight: 1.7, paddingLeft: "18px", margin: 0 }}>
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
        <div className="card" style={{ padding: "28px", border: "1.5px solid var(--clr-primary-200)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--clr-gray-900)", margin: "0 0 18px 0" }}>
            {lang === "hi" ? "चार प्रमुख मौसम डेटा स्रोत (Multi-Sensor Architecture)" : "Four Multi-Modal Observation Pillars"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--clr-gray-50)", border: "1px solid var(--clr-primary-200)" }}>
              <div className="card-icon card-icon-green" style={{ width: "36px", height: "36px", marginBottom: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                </svg>
              </div>
              <div style={{ fontWeight: 800, color: "var(--clr-gray-900)", fontSize: "13px" }}>Doppler Weather Radars</div>
              <div style={{ color: "var(--clr-gray-600)", fontSize: "11.5px", marginTop: "4px", lineHeight: 1.5 }}>
                IMD S, C, X-Band networks. QC de-aliasing, attenuation correction, and 3D composite mosaic.
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--clr-gray-50)", border: "1px solid var(--clr-primary-200)" }}>
              <div className="card-icon card-icon-blue" style={{ width: "36px", height: "36px", marginBottom: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <ellipse cx="12" cy="12" rx="9" ry="4" />
                  <path d="M12 3v18" />
                </svg>
              </div>
              <div style={{ fontWeight: 800, color: "var(--clr-gray-900)", fontSize: "13px" }}>INSAT-3D / 3DR Satellite</div>
              <div style={{ color: "var(--clr-gray-600)", fontSize: "11.5px", marginTop: "4px", lineHeight: 1.5 }}>
                TIR-1 Brightness Temperature, rapid cloud-top cooling rates (precursor to convective initiation).
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--clr-gray-50)", border: "1px solid var(--clr-primary-200)" }}>
              <div className="card-icon card-icon-gold" style={{ width: "36px", height: "36px", marginBottom: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div style={{ fontWeight: 800, color: "var(--clr-gray-900)", fontSize: "13px" }}>Ground Lightning Sensors</div>
              <div style={{ color: "var(--clr-gray-600)", fontSize: "11.5px", marginTop: "4px", lineHeight: 1.5 }}>
                IITM Damini / Blitzortung ground strikes. Detects charge separation and active stroke clusters.
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--clr-gray-50)", border: "1px solid var(--clr-primary-200)" }}>
              <div className="card-icon card-icon-green" style={{ width: "36px", height: "36px", marginBottom: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                </svg>
              </div>
              <div style={{ fontWeight: 800, color: "var(--clr-gray-900)", fontSize: "13px" }}>NWP Convective Indices</div>
              <div style={{ color: "var(--clr-gray-600)", fontSize: "11.5px", marginTop: "4px", lineHeight: 1.5 }}>
                NCMRWF / GFS CAPE, CIN, Lifted Index, and 0–6km vertical wind shear boundary conditions.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Accuracy Verification Benchmarks */}
        <div className="card" style={{ padding: "26px", backgroundColor: "var(--clr-primary-50)", border: "1.5px solid var(--clr-primary-200)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--clr-gray-900)", margin: "0 0 16px 0" }}>
            {lang === "hi" ? "मॉडल सत्यापन स्कोर (Operational Evaluation Scores)" : "Model Verification Metrics (Withheld Test Events)"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", textAlign: "center" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--clr-primary-200)" }}>
              <div style={{ fontSize: "11px", color: "var(--clr-gray-600)", fontWeight: 600 }}>CSI @ 35 dBZ</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--clr-primary-800)", marginTop: "2px" }}>0.42</div>
              <div style={{ fontSize: "10.5px", color: "var(--clr-gray-500)" }}>Baseline: 0.15</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--clr-primary-200)" }}>
              <div style={{ fontSize: "11px", color: "var(--clr-gray-600)", fontWeight: 600 }}>POD (Detection)</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--clr-primary-800)", marginTop: "2px" }}>0.76</div>
              <div style={{ fontSize: "10.5px", color: "var(--clr-gray-500)" }}>Baseline: 0.45</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--clr-primary-200)" }}>
              <div style={{ fontSize: "11px", color: "var(--clr-gray-600)", fontWeight: 600 }}>FAR (False Alarm)</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--alert-red)", marginTop: "2px" }}>0.31</div>
              <div style={{ fontSize: "10.5px", color: "var(--clr-gray-500)" }}>Baseline: 0.60</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--clr-primary-200)" }}>
              <div style={{ fontSize: "11px", color: "var(--clr-gray-600)", fontWeight: 600 }}>Pipeline Latency</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--clr-primary-800)", marginTop: "2px" }}>&lt;45s</div>
              <div style={{ fontSize: "10.5px", color: "var(--clr-gray-500)" }}>End-to-End Alert</div>
            </div>
          </div>
        </div>

        {/* Launch Dashboard CTA */}
        <div style={{ textAlign: "center", padding: "12px 0 20px 0" }}>
          <button
            onClick={onGoToDashboard}
            className="btn btn-primary"
            style={{ padding: "14px 34px", fontSize: "14px" }}
          >
            {lang === "hi" ? "लाइव मैप डैशबोर्ड खोलें →" : "Launch Live Radar Dashboard →"}
          </button>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <Footer onGoToNowcast={onGoToDashboard} lang={lang} />
    </div>
  );
}
