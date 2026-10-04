"use client";

interface FooterProps {
  onGoToHome?: () => void;
  onGoToNowcast?: () => void;
  onGoToSafety?: () => void;
  onGoToAbout?: () => void;
  lang: "en" | "hi";
}

export default function Footer({
  onGoToHome,
  onGoToNowcast,
  onGoToSafety,
  onGoToAbout,
  lang,
}: FooterProps) {
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "var(--footer-bg, #1A3320)",
        color: "#F8FAFC",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── National Tricolor Top Accent Strip ───────────────────────── */}
      <div className="tricolor-bar" />

      {/* ── Main Footer Grid ─────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "48px 24px 36px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "36px",
        }}
      >
        {/* ── Column 1: Brand & National Initiative ──────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "340px" }}>
          {/* Brand Logo & Name Lockup */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: onGoToHome ? "pointer" : "default",
            }}
            onClick={onGoToHome}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src="logo.png"
                alt="Minutes Ahead"
                width={40}
                height={40}
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
              <span
                style={{
                  fontSize: "19px",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "-0.01em",
                  display: "block",
                  lineHeight: 1.1,
                }}
              >
                Minutes Ahead
              </span>
            </div>
          </div>

          {/* Tagline / Bio Description */}
          <p
            style={{
              fontSize: "12.5px",
              color: "rgba(255, 255, 255, 0.72)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {lang === "hi"
              ? "एक एकीकृत वायुमंडलीय तात्कालिक पूर्वानुमान एवं वज्रपात पूर्व-चेतावनी पोर्टल, जो नागरिकों, किसानों एवं आपदा प्रबंधन प्राधिकरणों को वास्तविक समय में मौसम सुरक्षा प्रदान करता है।"
              : "A unified AI-driven meteorological nowcasting and convective early-warning portal empowering citizens, farmers, and disaster response teams with real-time atmospheric intelligence."}
          </p>

          {/* Government Initiative Badge Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              paddingTop: "6px",
            }}
          >
            {/* National Emblem Icon Frame */}
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "4px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#E2E8F0",
                flexShrink: 0,
              }}
              title="Government of India"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>

            {/* Digital India Logo Frame */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "4px",
                padding: "2px 6px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="digital-india.png"
                alt="Digital India"
                height={20}
                style={{ height: "20px", width: "auto", objectFit: "contain" }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes("/digital-india.png")) {
                    target.src = "/digital-india.png";
                  }
                }}
              />
            </div>

            <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600, lineHeight: 1.3 }}>
              Government of India Initiative
            </span>
          </div>
        </div>

        {/* ── Column 2: Quick Links ─────────────────────────────────── */}
        <div>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "0.02em",
              margin: "0 0 16px 0",
              textTransform: "capitalize",
            }}
          >
            {lang === "hi" ? "त्वरित लिंक" : "Quick Links"}
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "13px",
            }}
          >
            <li>
              <button
                onClick={onGoToHome}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "rgba(255, 255, 255, 0.70)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "color 0.15s ease",
                  fontSize: "13px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
              >
                {lang === "hi" ? "मुख्य पृष्ठ (Home)" : "Home"}
              </button>
            </li>
            <li>
              <button
                onClick={onGoToNowcast}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "rgba(255, 255, 255, 0.70)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "color 0.15s ease",
                  fontSize: "13px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
              >
                {lang === "hi" ? "लाइव नाउकास्ट (Nowcast)" : "Nowcast"}
              </button>
            </li>
            <li>
              <button
                onClick={onGoToSafety}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "rgba(255, 255, 255, 0.70)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "color 0.15s ease",
                  fontSize: "13px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
              >
                {lang === "hi" ? "सुरक्षा दिशा-निर्देश (Safety)" : "Public Safety"}
              </button>
            </li>
            <li>
              <button
                onClick={onGoToAbout}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "rgba(255, 255, 255, 0.70)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "color 0.15s ease",
                  fontSize: "13px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
              >
                {lang === "hi" ? "हमारे बारे में (About Us)" : "About"}
              </button>
            </li>
            <li>
              <button
                onClick={onGoToNowcast}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "rgba(255, 255, 255, 0.70)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "color 0.15s ease",
                  fontSize: "13px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
              >
                {lang === "hi" ? "वेधशाला स्टेशन" : "Observation Stations"}
              </button>
            </li>
          </ul>
        </div>

        {/* ── Column 3: Weather Services ────────────────────────────── */}
        <div>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "0.02em",
              margin: "0 0 16px 0",
              textTransform: "capitalize",
            }}
          >
            {lang === "hi" ? "मौसम सेवाएं" : "Services"}
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.70)",
            }}
          >
            <li
              style={{ cursor: "pointer", transition: "color 0.15s ease" }}
              onClick={onGoToNowcast}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
            >
              {lang === "hi" ? "आंधी-तूफान नाउकास्ट" : "Convective Nowcasting"}
            </li>
            <li
              style={{ cursor: "pointer", transition: "color 0.15s ease" }}
              onClick={onGoToNowcast}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
            >
              {lang === "hi" ? "वज्रपात चेतावनी सेवा" : "Lightning Strike Prediction"}
            </li>
            <li
              style={{ cursor: "pointer", transition: "color 0.15s ease" }}
              onClick={onGoToNowcast}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
            >
              {lang === "hi" ? "डॉपलर रडार मोज़ेक" : "Doppler Radar Mosaic"}
            </li>
            <li
              style={{ cursor: "pointer", transition: "color 0.15s ease" }}
              onClick={onGoToSafety}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
            >
              {lang === "hi" ? "कृषि मौसम परामर्श" : "Agricultural Agromet Advisory"}
            </li>
            <li
              style={{ cursor: "pointer", transition: "color 0.15s ease" }}
              onClick={onGoToNowcast}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
            >
              {lang === "hi" ? "वायुमंडलीय अस्थिरता (CAPE)" : "Atmospheric Instability (CAPE)"}
            </li>
          </ul>
        </div>

        {/* ── Column 4: Legal & Helplines ───────────────────────────── */}
        <div>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "0.02em",
              margin: "0 0 16px 0",
              textTransform: "capitalize",
            }}
          >
            {lang === "hi" ? "विधिक एवं आपातकालीन सहायता" : "Helpline & Governance"}
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.70)",
            }}
          >
            <li
              style={{ cursor: "pointer", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
            >
              {lang === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}
            </li>
            <li
              style={{ cursor: "pointer", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#81C784")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.70)")}
            >
              {lang === "hi" ? "उपयोग की शर्तें" : "Terms of Use"}
            </li>
            <li style={{ paddingTop: "6px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 10px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(220, 38, 38, 0.2)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#FCA5A5",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                <span>NDMA: 1078 · Emergency: 112</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Sub-Footer Bottom Bar ───────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "#122416",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.55)",
          }}
        >
          <div>
            © 2026 <strong>Minutes Ahead</strong> — {lang === "hi" ? "राष्ट्रीय मौसम नाउकास्टिंग पोर्टल। सर्वाधिकार सुरक्षित।" : "National Severe Weather Nowcasting Platform. All rights reserved."}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span>IMD · IITM · MoES Telemetry</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
