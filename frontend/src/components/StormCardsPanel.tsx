"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { StormCard } from "@/app/page";

interface StormCardsPanelProps {
  storms: StormCard[];
  selectedStorm: StormCard | null;
  onSelect: (s: StormCard | null) => void;
}

const SEV_STYLE: Record<string, string> = {
  NONE: "sev-none", MODERATE: "sev-moderate", SEVERE: "sev-severe", EXTREME: "sev-extreme",
};
const SEV_ICON: Record<string, string> = {
  NONE: "🟢", MODERATE: "🟡", SEVERE: "🔴", EXTREME: "🟣",
};

export default function StormCardsPanel({ storms, selectedStorm, onSelect }: StormCardsPanelProps) {
  return (
    <div className="glass-panel p-3">
      <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
        ⛈️ STORM CELLS <span className="ml-auto text-cyan-400">{storms.length}</span>
      </div>
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
        <AnimatePresence>
          {storms.map((storm, i) => (
            <motion.div
              key={storm.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(selectedStorm?.id === storm.id ? null : storm)}
              className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                selectedStorm?.id === storm.id
                  ? "border-cyan-500/60 bg-cyan-500/10"
                  : "border-transparent hover:border-white/10 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{storm.id}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${SEV_STYLE[storm.severity]}`}>
                  {SEV_ICON[storm.severity]} {storm.severity}
                </span>
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                📍 {storm.nearest_district ?? "Unknown"}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                <span>⚡ {storm.max_reflectivity.toFixed(0)} dBZ</span>
                <span>💨 {storm.speed_kmh.toFixed(0)} km/h</span>
                {storm.eta_minutes && (
                  <span className="text-amber-400 font-semibold">
                    ETA {Math.round(storm.eta_minutes)}m
                  </span>
                )}
              </div>
              {/* Confidence bar */}
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[10px] text-slate-600">Confidence</span>
                <div className="flex-1 h-1 bg-white/10 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${storm.confidence * 100}%`,
                      background: `linear-gradient(90deg, ${storm.severity_color}, ${storm.severity_color}80)`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">{(storm.confidence * 100).toFixed(0)}%</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {storms.length === 0 && (
          <div className="text-center text-slate-600 text-xs py-4">No active storm cells</div>
        )}
      </div>
    </div>
  );
}
