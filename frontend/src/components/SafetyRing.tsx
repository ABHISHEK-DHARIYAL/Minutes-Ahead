"use client";
import { useEffect, useState } from "react";
import type { StormCard } from "@/app/page";

interface SafetyRingProps {
  selectedStorm: StormCard | null;
}

export default function SafetyRing({ selectedStorm }: SafetyRingProps) {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!selectedStorm?.eta_minutes) { setCountdown(0); return; }
    setCountdown(Math.round(selectedStorm.eta_minutes * 60));
    const id = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(id);
  }, [selectedStorm]);

  const inDanger = countdown > 0 && countdown < 30 * 60; // within 30 min
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className={`glass-panel p-3 transition-all ${inDanger ? "border-red-500/60 animate-pulse-glow" : ""}`}>
      <div className="text-xs font-semibold text-slate-400 mb-2">LIGHTNING SAFETY RING</div>

      {countdown > 0 ? (
        <>
          <div className="text-center">
            <div className={`text-2xl font-mono font-black ${inDanger ? "text-red-400" : "text-amber-400"}`}>
              {mins}:{secs.toString().padStart(2, "0")}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">until storm arrival</div>
          </div>
          <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-[11px] text-amber-300 font-medium">30-30 RULE:</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              If thunder within 30s of lightning → seek shelter immediately. 
              Wait 30 min after last thunder before going outside.
            </p>
          </div>
        </>
      ) : (
        <div className="text-[11px] text-slate-600 text-center py-2">
          Select a storm cell to see ETA and safety countdown
        </div>
      )}

      {/* Safe distance calculator */}
      <div className="mt-2 text-[10px] text-slate-600">
        <span className="text-slate-500">Safe distance rule:</span> km = seconds÷3 (sound delay)
      </div>
    </div>
  );
}
