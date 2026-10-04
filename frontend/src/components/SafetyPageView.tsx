"use client";
import Footer from "@/components/Footer";

interface SafetyPageViewProps {
  onGoToNowcast: () => void;
  lang: "en" | "hi";
}

export default function SafetyPageView({ onGoToNowcast, lang }: SafetyPageViewProps) {
  return (
    <div style={{ width: "100%", flex: 1, overflowY: "auto", backgroundColor: "var(--clr-gray-50)" }}>
      {/* ── 1. Hero Header (e-Samanvit Soft Forest Green Banner) ───── */}
      <section
        style={{
          width: "100%",
          borderBottom: "2px solid var(--clr-primary-200)",
          padding: "44px 24px 38px 24px",
          background: "linear-gradient(180deg, #EDF7EE 0%, #F5FAF6 50%, #EAF4EB 100%)",
          boxShadow: "0 6px 24px rgba(27, 94, 32, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1160px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
            <span className="esam-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>
                {lang === "hi"
                  ? "NDMA एवं IMD संयुक्त राष्ट्रीय सुरक्षा दिशा-निर्देश"
                  : "NDMA & IMD National Convective Safety Advisory"}
              </span>
            </span>
            <span className="esam-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {lang === "hi" ? "24x7 आपातकालीन प्रोटोकॉल" : "24/7 Life Safety Protocol"}
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(1.85rem, 3.2vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--clr-primary-900)",
              letterSpacing: "-0.02em",
              margin: "0 0 8px 0",
              lineHeight: 1.2,
            }}
          >
            {lang === "hi"
              ? "आकाशीय बिजली एवं आंधी-तूफान सुरक्षा प्रोटोकॉल"
              : "National Thunderstorm & Lightning Safety Protocol"}
          </h1>

          <p style={{ fontSize: "0.9375rem", color: "var(--clr-gray-600)", lineHeight: 1.6, margin: "0 0 22px 0", maxWidth: "780px" }}>
            {lang === "hi"
              ? "भारत में प्रतिवर्ष आकाशीय बिजली (वज्रपात) से 2,500 से अधिक नागरिकों की जान जाती है। समय रहते सही सुरक्षा नियमों का पालन करने से 95% से अधिक दुर्घटनाओं को पूर्णतः रोका जा सकता है।"
              : "Lightning is India's leading weather-related hazard, claiming over 2,500 lives annually. Adhering to scientifically verified meteorological safety protocols prevents more than 95% of lightning strike injuries."}
          </p>

          {/* 24x7 Helplines Strip in e-Samanvit Card Style */}
          <div
            className="card"
            style={{
              padding: "14px 18px",
              border: "1.5px solid var(--clr-primary-200)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "14px",
              fontSize: "12.5px",
            }}
          >
            <span style={{ fontWeight: 800, color: "var(--clr-primary-900)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📞</span>
              <span>{lang === "hi" ? "24x7 राष्ट्रीय आपातकालीन हेल्पलाइन:" : "24/7 National Emergency Helplines:"}</span>
            </span>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--clr-gray-700)" }}>
                NDMA Disaster: <strong style={{ color: "var(--alert-red)", fontFamily: "monospace", fontSize: "13px" }}>1078</strong>
              </span>
              <span style={{ color: "var(--clr-gray-700)" }}>
                National Emergency: <strong style={{ color: "var(--clr-primary-800)", fontFamily: "monospace", fontSize: "13px" }}>112</strong>
              </span>
              <span style={{ color: "var(--clr-gray-700)" }}>
                Medical / Ambulance: <strong style={{ color: "var(--alert-green)", fontFamily: "monospace", fontSize: "13px" }}>108</strong>
              </span>
              <span style={{ color: "var(--clr-gray-700)" }}>
                IMD Weather Enquiry: <strong style={{ color: "var(--clr-gray-900)", fontFamily: "monospace", fontSize: "13px" }}>1800-180-1717</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── National Tricolor Accent Strip ─────────────────────────── */}
      <div className="tricolor-bar" />

      {/* ── 2. The 30-30 Golden Lightning Rule ──────────────────────── */}
      <section style={{ maxWidth: "1160px", margin: "28px auto 0 auto", padding: "0 24px" }}>
        <div
          className="card"
          style={{
            padding: "26px",
            border: "1.5px solid var(--clr-primary-200)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div className="card-icon card-icon-gold" style={{ width: "42px", height: "42px", marginBottom: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--clr-gray-900)", margin: 0 }}>
                {lang === "hi" ? "30-30 का राष्ट्रीय जीवन रक्षा नियम" : "The National 30-30 Lightning Safety Rule"}
              </h2>
              <div style={{ fontSize: "11.5px", color: "var(--clr-gray-600)" }}>
                Scientifically endorsed by the National Weather Service & Ministry of Earth Sciences
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: "16px" }}>
            {/* Rule 1 */}
            <div style={{ padding: "18px", backgroundColor: "var(--clr-primary-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--clr-primary-200)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "18px", fontWeight: 900, color: "var(--clr-primary-800)", fontFamily: "monospace" }}>1.</span>
                <strong style={{ fontSize: "14px", color: "var(--clr-primary-900)" }}>
                  {lang === "hi" ? "30 सेकंड का फ्लैश-टू-बैंग नियम" : "30 Seconds Flash-to-Thunder Rule"}
                </strong>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--clr-gray-700)", lineHeight: 1.6, margin: 0 }}>
                {lang === "hi"
                  ? "यदि बिजली चमकने और गड़गड़ाहट (thunder) के बीच का समय 30 सेकंड से कम है, तो आंधी-तूफान आपसे 10 किमी से भी नजदीक है। तुरंत किसी पक्के मकान या बंद चौपहिया वाहन में शरण लें।"
                  : "If the time between seeing lightning flash and hearing thunder is less than 30 seconds, the storm cell is within 10 km. Seek immediate masonry or hard-top vehicle shelter."}
              </p>
            </div>

            {/* Rule 2 */}
            <div style={{ padding: "18px", backgroundColor: "var(--clr-primary-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--clr-primary-200)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "18px", fontWeight: 900, color: "var(--clr-primary-800)", fontFamily: "monospace" }}>2.</span>
                <strong style={{ fontSize: "14px", color: "var(--clr-primary-900)" }}>
                  {lang === "hi" ? "30 मिनट प्रतीक्षा का नियम" : "30 Minutes Post-Thunder Waiting Rule"}
                </strong>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--clr-gray-700)", lineHeight: 1.6, margin: 0 }}>
                {lang === "hi"
                  ? "अंतिम गड़गड़ाहट सुनने के कम से कम 30 मिनट बाद तक सुरक्षित आश्रय में ही रहें। अधिकांश मौतें तूफान शुरू होने से पहले या समाप्त होने के ठीक बाद होती हैं।"
                  : "Remain in shelter for at least 30 minutes after the last thunderclap is heard. Over 50% of lightning casualties occur after the storm appears to have passed."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Four Core Public Safety Modules ──────────────────────── */}
      <section style={{ maxWidth: "1160px", margin: "28px auto 0 auto", padding: "0 24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--clr-gray-900)", marginBottom: "16px" }}>
          {lang === "hi" ? "विशिष्ट परिस्थितिजन्य सुरक्षा नियम" : "Comprehensive Domain-Specific Safety Guidelines"}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "16px" }}>
          {/* Card 1: Farmers */}
          <div className="card card-hover" style={{ padding: "20px", borderTop: "4px solid var(--clr-primary-700)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div className="card-icon card-icon-green" style={{ width: "38px", height: "38px", marginBottom: 0 }}>
                🌾
              </div>
              <h3 style={{ fontSize: "14.5px", fontWeight: 800, color: "var(--clr-gray-900)", margin: 0 }}>
                {lang === "hi" ? "किसान एवं खुले खेत सुरक्षा" : "Farmers & Outdoor Workers"}
              </h3>
            </div>
            <ul style={{ fontSize: "12px", color: "var(--clr-gray-600)", lineHeight: 1.65, paddingLeft: "16px", margin: 0 }}>
              <li>
                {lang === "hi"
                  ? "खेतों में हल चलाना, बुवाई व कटाई तुरंत रोक दें।"
                  : "Halt tractor operation, tilling, and open-field harvesting immediately."}
              </li>
              <li>
                {lang === "hi"
                  ? "अकेले खड़े ऊंचे पेड़ों के नीचे आश्रय कभी न लें।"
                  : "Never seek shelter under solitary tall trees; they are primary lightning conduits."}
              </li>
              <li>
                {lang === "hi"
                  ? "ट्यूबवेल, लोहे की बाड़, ट्रैक्टर व लोहे के औजारों से दूर रहें।"
                  : "Stay clear of metal wire fencing, tractors, and irrigation pipe arrays."}
              </li>
              <li>
                {lang === "hi"
                  ? "मवेशियों को तालाबों से हटाकर पक्के बाड़े में बांधें।"
                  : "Move livestock away from ponds and pastures into enclosed brick sheds."}
              </li>
            </ul>
          </div>

          {/* Card 2: Urban Commuters */}
          <div className="card card-hover" style={{ padding: "20px", borderTop: "4px solid var(--alert-info)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div className="card-icon card-icon-blue" style={{ width: "38px", height: "38px", marginBottom: 0 }}>
                🚗
              </div>
              <h3 style={{ fontSize: "14.5px", fontWeight: 800, color: "var(--clr-gray-900)", margin: 0 }}>
                {lang === "hi" ? "शहरी नागरिक, यात्री एवं छात्र" : "Urban Commuters & Drivers"}
              </h3>
            </div>
            <ul style={{ fontSize: "12px", color: "var(--clr-gray-600)", lineHeight: 1.65, paddingLeft: "16px", margin: 0 }}>
              <li>
                {lang === "hi"
                  ? "तेज आंधी में दोपहिया वाहन न चलाएं; बंद वाहन में रुकें।"
                  : "Cease riding motorcycles and bicycles; hard-topped cars act as safe Faraday cages."}
              </li>
              <li>
                {lang === "hi"
                  ? "बिजली के खंभों, होर्डिंग्स व जलभराव से दूर रहें।"
                  : "Stay clear of high-voltage transmission lines, advertising billboards, and flooded streets."}
              </li>
              <li>
                {lang === "hi"
                  ? "खुले बस स्टैंड या टीन शेड में खड़े न हों।"
                  : "Do not shelter beneath open bus stops or temporary metal-roofed canopies."}
              </li>
              <li>
                {lang === "hi"
                  ? "छाते की नुकीली धातु की नोक को ऊपर न रखें।"
                  : "Do not raise umbrellas with pointed metal tips in open squall environments."}
              </li>
            </ul>
          </div>

          {/* Card 3: Indoor Precautions */}
          <div className="card card-hover" style={{ padding: "20px", borderTop: "4px solid var(--clr-primary-800)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div className="card-icon card-icon-green" style={{ width: "38px", height: "38px", marginBottom: 0 }}>
                🏠
              </div>
              <h3 style={{ fontSize: "14.5px", fontWeight: 800, color: "var(--clr-gray-900)", margin: 0 }}>
                {lang === "hi" ? "घर एवं भवन के अंदर सुरक्षा" : "Indoor Home & School Precautions"}
              </h3>
            </div>
            <ul style={{ fontSize: "12px", color: "var(--clr-gray-600)", lineHeight: 1.65, paddingLeft: "16px", margin: 0 }}>
              <li>
                {lang === "hi"
                  ? "कंप्यूटर, टीवी व एसी के मुख्य प्लग दीवार से निकाल दें।"
                  : "Unplug sensitive electronics and air conditioners before the convective front arrives."}
              </li>
              <li>
                {lang === "hi"
                  ? "पानी के नल, शावर व सिंक से दूर रहें (धातु के पाइप बिजली ला सकते हैं)।"
                  : "Avoid touching plumbing fixtures, faucets, and sinks; metal piping conducts surges."}
              </li>
              <li>
                {lang === "hi"
                  ? "खिड़कियों, बालकनी व बाहरी दरवाजों से दूर रहें।"
                  : "Stay clear of glass windows, open balconies, and exterior doorways."}
              </li>
              <li>
                {lang === "hi"
                  ? "तार वाले फोन का उपयोग न करें; मोबाइल फोन सुरक्षित है।"
                  : "Never use corded landlines during storms; cellular phones are completely safe."}
              </li>
            </ul>
          </div>

          {/* Card 4: Open Ground Crouch */}
          <div className="card card-hover" style={{ padding: "20px", borderTop: "4px solid var(--alert-orange)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div className="card-icon card-icon-orange" style={{ width: "38px", height: "38px", marginBottom: 0 }}>
                ⚠️
              </div>
              <h3 style={{ fontSize: "14.5px", fontWeight: 800, color: "var(--clr-gray-900)", margin: 0 }}>
                {lang === "hi" ? "खुले में कोई आश्रय न मिलने पर" : "If Caught in Open Terrain"}
              </h3>
            </div>
            <ul style={{ fontSize: "12px", color: "var(--clr-gray-600)", lineHeight: 1.65, paddingLeft: "16px", margin: 0 }}>
              <li>
                {lang === "hi"
                  ? "जमीन पर कभी भी सीधा न लेटें।"
                  : "NEVER lie flat on the ground; doing so maximizes surface voltage exposure."}
              </li>
              <li>
                {lang === "hi"
                  ? "वज्रपात सुरक्षा मुद्रा अपनाएं: पंजों के बल बैठें, सिर घुटनों में झुकाएं।"
                  : "Adopt the Lightning Crouch: crouch on balls of feet, tuck head, cover ears with hands."}
              </li>
              <li>
                {lang === "hi"
                  ? "दोनों एड़ियों को आपस में जोड़कर रखें ताकि ग्राउंड करंट न फैले।"
                  : "Touch heels together so electrical current does not traverse across the body."}
              </li>
              <li>
                {lang === "hi"
                  ? "समूह में हों तो एक-दूसरे से कम से कम 5 मीटर की दूरी बनाए रखें।"
                  : "If in a group, disperse immediately with at least 5 meters between individuals."}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. Emergency First Aid for Lightning Victims ─────────────── */}
      <section style={{ maxWidth: "1160px", margin: "28px auto 0 auto", padding: "0 24px" }}>
        <div
          className="card"
          style={{
            padding: "24px",
            border: "1.5px solid var(--alert-red-bdr)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <span style={{ fontSize: "22px" }}>🩺</span>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--alert-red)", margin: 0 }}>
                {lang === "hi" ? "वज्रपात पीड़ित के लिए आपातकालीन प्राथमिक उपचार (First Aid)" : "Emergency First Aid for Lightning Strike Victims"}
              </h2>
              <div style={{ fontSize: "11.5px", color: "var(--clr-gray-600)" }}>
                Immediate CPR within 4 minutes can save a victim's life
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--alert-red-bg)",
              border: "1px solid var(--alert-red-bdr)",
              fontSize: "12.5px",
              color: "var(--alert-red)",
              marginBottom: "16px",
              fontWeight: 700,
            }}
          >
            {lang === "hi"
              ? "महत्वपूर्ण तथ्य: बिजली गिरे हुए व्यक्ति के शरीर में कोई विद्युत आवेश (charge) नहीं रहता। उसे तुरंत छूना और प्राथमिक उपचार देना 100% सुरक्षित है।"
              : "CRITICAL MEDICAL FACT: Lightning victims carry NO residual electrical charge. It is 100% safe to touch and treat them immediately."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "12px", fontSize: "12px" }}>
            <div style={{ padding: "14px", backgroundColor: "var(--clr-gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--clr-gray-200)" }}>
              <strong style={{ color: "var(--clr-gray-900)", display: "block", marginBottom: "4px" }}>
                1. {lang === "hi" ? "तुरंत 112 / 108 पर कॉल करें" : "Call 112 / 108 Emergency"}
              </strong>
              <span style={{ color: "var(--clr-gray-600)", lineHeight: 1.5, display: "block" }}>
                {lang === "hi"
                  ? "निकटतम अस्पताल और एंबुलेंस को तुरंत सूचना दें। सटीक स्थान बताएं।"
                  : "Dispatch professional emergency medical responders immediately with exact coordinates."}
              </span>
            </div>

            <div style={{ padding: "14px", backgroundColor: "var(--clr-gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--clr-gray-200)" }}>
              <strong style={{ color: "var(--clr-gray-900)", display: "block", marginBottom: "4px" }}>
                2. {lang === "hi" ? "सांस और नब्ज जांचें (CPR शुरू करें)" : "Check Airway & Initiate CPR"}
              </strong>
              <span style={{ color: "var(--clr-gray-600)", lineHeight: 1.5, display: "block" }}>
                {lang === "hi"
                  ? "यदि सांस या दिल की धड़कन रुक गई है, तो बिना देर किए छाती दबाकर CPR शुरू करें।"
                  : "If pulse or respiration has stopped, immediately begin chest compressions and rescue breathing."}
              </span>
            </div>

            <div style={{ padding: "14px", backgroundColor: "var(--clr-gray-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--clr-gray-200)" }}>
              <strong style={{ color: "var(--clr-gray-900)", display: "block", marginBottom: "4px" }}>
                3. {lang === "hi" ? "जलन व सदमे (Shock) का उपचार" : "Treat for Shock & Burns"}
              </strong>
              <span style={{ color: "var(--clr-gray-600)", lineHeight: 1.5, display: "block" }}>
                {lang === "hi"
                  ? "पीड़ित को सूखे स्थान पर रखें, कंबल से ढकें और पैर थोड़े ऊंचे रखें।"
                  : "Keep victim warm, elevate legs slightly, and dress burns with sterile clean cloth until doctors arrive."}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Call To Action Banner ────────────────────────────────── */}
      <section style={{ maxWidth: "1160px", margin: "28px auto 48px auto", padding: "0 24px" }}>
        <div
          style={{
            padding: "26px",
            borderRadius: "var(--radius-xl)",
            backgroundColor: "var(--clr-primary-800)",
            color: "#ffffff",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "18px",
            boxShadow: "0 6px 24px rgba(46, 125, 50, 0.25)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 6px 0" }}>
              {lang === "hi"
                ? "तात्कालिक आंधी-तूफान एवं वज्रपात की लाइव ट्रैकिंग करें"
                : "Monitor Severe Convective Storms in Real Time"}
            </h3>
            <p style={{ fontSize: "13px", opacity: 0.9, margin: 0, maxWidth: "600px", lineHeight: 1.5 }}>
              {lang === "hi"
                ? "Minutes Ahead के डॉपलर रडार और AI नाउकास्ट मैप के जरिए अगले 0–3 घंटे के सटीक खतरे का अनुमान देखें।"
                : "Utilize the 17 IMD Doppler radars, geostationary satellite feeds, and cross-attention nowcasting models to track storm cells minutes ahead."}
            </p>
          </div>
          <button
            onClick={onGoToNowcast}
            style={{
              padding: "12px 24px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#ffffff",
              color: "var(--clr-primary-900)",
              fontWeight: 800,
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
              transition: "transform 0.15s ease",
            }}
          >
            <span>{lang === "hi" ? "लाइव नाउकास्ट मैप खोलें →" : "Launch Live Nowcast Map →"}</span>
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <Footer onGoToNowcast={onGoToNowcast} lang={lang} />
    </div>
  );
}
