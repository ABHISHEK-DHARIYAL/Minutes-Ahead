"use client";

interface AIReasoningPanelProps {
  importance: Record<string, number>;
}

const SOURCE_COLORS: Record<string, string> = {
  Radar: "#06B6D4",
  Satellite: "#A78BFA",
  Lightning: "#FCD34D",
  NWP: "#34D399",
};

export default function AIReasoningPanel({ importance }: AIReasoningPanelProps) {
  const total = Object.values(importance).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(importance).sort((a, b) => b[1] - a[1]);

  return (
    <div className="glass-panel p-3">
      <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
        🧠 AI REASONING
        <span className="ml-auto text-[10px] text-slate-600">source contributions</span>
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map(([src, val]) => {
          const pct = ((val / total) * 100).toFixed(0);
          const color = SOURCE_COLORS[src] ?? "#94A3B8";
          return (
            <div key={src}>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span style={{ color }}>{src}</span>
                <span className="text-slate-500">{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-700"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}80)`,
                    boxShadow: `0 0 8px ${color}60` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-600 mt-2">
        Powered by cross-attention fusion. Radar dominates in active cells; NWP leads pre-initiation.
      </p>
    </div>
  );
}
