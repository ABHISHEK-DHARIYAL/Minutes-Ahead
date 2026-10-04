"use client";

interface HamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "hi";
  onNavigateItem: (target: "nowcast" | "minutes-ahead" | "stations" | "atmosphere" | "warnings" | "prediction") => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function HamburgerDrawer({
  isOpen,
  onClose,
  lang,
  onNavigateItem,
  theme,
  onToggleTheme,
}: HamburgerDrawerProps) {
  if (!isOpen) return null;

  const isDark = theme === "dark";

  const menuItems: {
    id: "nowcast" | "minutes-ahead" | "stations" | "atmosphere" | "warnings" | "prediction";
    label: string;
    labelHi: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "nowcast",
      label: "Live Nowcast",
      labelHi: "लाइव नाउकास्ट",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 12l4-4" />
          <path d="M12 3v2" />
          <path d="M12 19v2" />
          <path d="M3 12h2" />
          <path d="M19 12h2" />
        </svg>
      ),
    },
    {
      id: "minutes-ahead",
      label: "Minutes Ahead",
      labelHi: "मिनट्स अहेड",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "stations",
      label: "Observation Stations",
      labelHi: "वेधशाला स्टेशन",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m14 10-4 4" />
          <path d="M12 6v2" />
          <path d="M18 12h-2" />
        </svg>
      ),
    },
    {
      id: "atmosphere",
      label: "Atmospheric Conditions",
      labelHi: "वायुमंडलीय स्थितियां",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
      ),
    },
    {
      id: "warnings",
      label: "Early Warnings",
      labelHi: "पूर्व चेतावनियां",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      id: "prediction",
      label: "AI Prediction",
      labelHi: "एआई भविष्यवाणी",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="M4.93 4.93l2.83 2.83" />
          <path d="M16.24 16.24l2.83 2.83" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: isDark ? "rgba(10, 16, 10, 0.7)" : "rgba(30, 30, 27, 0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          transition: "opacity 0.25s ease",
        }}
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "320px",
          height: "100%",
          backgroundColor: isDark ? "var(--clr-white)" : "#FFFFFF",
          boxShadow: "var(--shadow-drawer)",
          display: "flex",
          flexDirection: "column",
          zIndex: 10000,
          borderLeft: isDark ? "1px solid var(--clr-primary-300)" : "1.5px solid var(--clr-primary-200)",
          color: isDark ? "#F8FAFC" : "var(--clr-gray-900)",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "16px 18px",
            borderBottom: isDark ? "1px solid var(--clr-primary-300)" : "1px solid var(--clr-primary-200)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: isDark ? "var(--clr-gray-100)" : "var(--clr-primary-50)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src="logo.png"
                alt="Minutes Ahead Logo"
                width={36}
                height={36}
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
              <div style={{ fontWeight: 800, fontSize: "14.5px", letterSpacing: "-0.01em", color: isDark ? "var(--clr-primary-900)" : "var(--clr-primary-900)" }}>
                Minutes Ahead
              </div>
              <div style={{ fontSize: "10px", color: isDark ? "var(--clr-gray-500)" : "var(--clr-gray-600)", fontWeight: 500 }}>
                {lang === "hi" ? "मौसम चेतावनी पोर्टल" : "Public Safety Nowcasting"}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-md)",
              backgroundColor: isDark ? "var(--clr-gray-200)" : "#FFFFFF",
              border: isDark ? "1px solid var(--clr-primary-300)" : "1px solid var(--clr-primary-200)",
              color: isDark ? "var(--clr-gray-600)" : "var(--clr-gray-700)",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all var(--duration-fast)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer Body — Clean List of 6 Items */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "10.5px",
              fontWeight: 800,
              color: "var(--clr-gray-500)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "2px 8px 4px 8px",
            }}
          >
            {lang === "hi" ? "मेन्यू सेवाएं" : "Portal Services"}
          </div>

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigateItem(item.id);
                onClose();
              }}
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: "var(--radius-md)",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                border: isDark ? "1px solid var(--clr-primary-200)" : "1px solid var(--clr-gray-200)",
                backgroundColor: isDark ? "var(--clr-gray-100)" : "#FFFFFF",
                color: isDark ? "var(--clr-gray-800)" : "var(--clr-gray-800)",
                transition: "all var(--duration-fast) var(--ease-out)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? "var(--clr-primary-100)" : "var(--clr-primary-50)";
                e.currentTarget.style.borderColor = "var(--clr-primary-400)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? "var(--clr-gray-100)" : "#FFFFFF";
                e.currentTarget.style.borderColor = isDark ? "var(--clr-primary-200)" : "var(--clr-gray-200)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--clr-primary-100)",
                    color: "var(--clr-primary-800)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "1px solid var(--clr-primary-200)",
                  }}
                >
                  {item.icon}
                </div>
                <span style={{ fontSize: "13.5px", fontWeight: 600 }}>
                  {lang === "hi" ? item.labelHi : item.label}
                </span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--clr-primary-600)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>

        {/* Drawer Footer with Theme Toggle (Accessible in Settings, Not prominent in main navbar) */}
        <div
          style={{
            padding: "14px 18px",
            borderTop: isDark ? "1px solid var(--clr-primary-300)" : "1px solid var(--clr-gray-200)",
            backgroundColor: isDark ? "var(--clr-gray-100)" : "var(--clr-gray-50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--clr-gray-600)" }}>
            {lang === "hi" ? "थीम मोड" : "Theme Preference"}
          </div>

          <button
            onClick={onToggleTheme}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              backgroundColor: isDark ? "var(--clr-primary-100)" : "#FFFFFF",
              border: "1.5px solid var(--clr-primary-200)",
              color: isDark ? "var(--clr-primary-800)" : "var(--clr-primary-800)",
              fontSize: "11.5px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {isDark ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </aside>
    </div>
  );
}
