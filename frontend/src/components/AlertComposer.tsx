"use client";
import { useState } from "react";
import type { StormCard } from "@/app/page";

interface AlertComposerProps {
  storm: StormCard;
  lang: "en" | "hi" | "gu";
  mlApiUrl: string;
}

const LANG_LABEL = { en: "English", hi: "हिंदी", gu: "ગુજરાતી" };

export default function AlertComposer({ storm, lang, mlApiUrl }: AlertComposerProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${mlApiUrl}/alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: storm.nearest_district ?? "Unknown",
          language: lang,
          severity: storm.severity === "EXTREME" ? 3 : storm.severity === "SEVERE" ? 2 : 1,
        }),
      });
      const data = await res.json();
      setText(data.alert_text);
    } catch {
      setText(getLocalAlert(storm, lang));
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-3">
      <div className="text-xs font-semibold text-slate-400 mb-2">ALERT COMPOSER</div>
      <div className="text-[11px] text-slate-500 mb-2">
        Lang: <span className="text-cyan-400">{LANG_LABEL[lang]}</span> · District: <span className="text-amber-400">{storm.nearest_district}</span>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all mb-2"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(6,182,212,0.3))", border: "1px solid rgba(124,58,237,0.5)", color: "#C4B5FD" }}
      >
        {loading ? "Generating…" : "Generate CAP Alert"}
      </button>

      {text && (
        <div className="relative">
          {/* SMS preview */}
          <div className="bg-[#1a2433] rounded-xl p-3 text-xs text-slate-300 leading-relaxed border border-white/5">
            <div className="text-[10px] text-slate-600 mb-1">SMS/WhatsApp Preview</div>
            <p>{text}</p>
          </div>
          <button
            onClick={copy}
            className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded"
            style={{ background: "rgba(6,182,212,0.2)", color: "#67E8F9", border: "1px solid rgba(6,182,212,0.3)" }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

function getLocalAlert(storm: StormCard, lang: "en" | "hi" | "gu"): string {
  const dist = storm.nearest_district ?? "Unknown";
  const eta = storm.eta_minutes ? `${Math.round(storm.eta_minutes)} minutes` : "soon";
  const templates = {
    en: `IMD WARNING: Severe thunderstorm approaching ${dist} in ${eta}. Max reflectivity ${storm.max_reflectivity.toFixed(0)} dBZ. Seek shelter immediately. Avoid open areas. Minutes Ahead Alert.`,
    hi: `IMD चेतावनी: ${dist} में ${eta} में भीषण आंधी। तुरंत आश्रय लें। खुले स्थानों से दूर रहें।`,
    gu: `IMD ચેતવણી: ${dist}માં ${eta}માં ભારે વાવાઝોડું. તાત્કાલિક આશ્રય લો.`,
  };
  return templates[lang];
}
