import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Minutes Ahead — AI/ML Thunderstorm & Lightning Nowcasting",
  description:
    "Minutes Ahead: Real-time 0-3h thunderstorm and lightning early warning system powered by AI/ML multi-sensor fusion. Built for India Meteorological Department (IMD) & Ministry of Earth Sciences.",
  keywords: ["Minutes Ahead", "thunderstorm", "lightning", "nowcasting", "IMD", "MoES", "India weather", "AI nowcast"],
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "Minutes Ahead — AI Thunderstorm & Lightning Nowcasting",
    description: "District-level 0-3h lightning & severe weather early warnings for India",
    type: "website",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#2E7D32",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="antialiased bg-[#f8fafc] text-[#0f172a]">{children}</body>
    </html>
  );
}
