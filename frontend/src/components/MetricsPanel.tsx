"use client";
import { useEffect, useState } from "react";

interface MetricsPanelProps { mlApiUrl: string; }

interface Metrics {
  model: string;
  evaluation_period: string;
  metrics: Record<string, number>;
  note: string;
}

export default function MetricsPanel({ mlApiUrl }: MetricsPanelProps) {
  const [data, setData] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch(`${mlApiUrl}/metrics`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(MOCK_METRICS));
  }, [mlApiUrl]);

  if (!data) return <div className="glass-panel p-3 text-xs text-slate-600">Loading metrics…</div>;

  const PAIRS = [
    { key: "CSI_30dBZ_60min",             label: "CSI@30dBZ/60m",     hi: true },
    { key: "POD_30dBZ_60min",             label: "POD",               hi: true },
    { key: "FAR_30dBZ_60min",             label: "FAR",               hi: false },
    { key: "HSS_30dBZ_60min",             label: "HSS",               hi: true },
    { key: "Brier_lightning",             label: "Brier (⚡)",         hi: false },
    { key: "baseline_persistence_CSI",    label: "Persist. CSI",      hi: true },
    { key: "baseline_optflow_CSI",        label: "OptFlow CSI",       hi: true },
  ];

  return (
    <div className="glass-panel p-3">
      <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
        📊 FORECASTER METRICS <span className="text-[10px] ml-auto text-slate-600">{data.evaluation_period}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {PAIRS.map(({ key, label, hi }) => {
          const val = data.metrics[key] ?? 0;
          const color = key.startsWith("baseline") ? "#64748B" : hi ? "#34D399" : "#F87171";
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-28 shrink-0">{label}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded overflow-hidden">
                <div className="h-full rounded" style={{ width: `${val * 100}%`, background: color }} />
              </div>
              <span className="text-[10px] font-mono" style={{ color }}>{val.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-slate-600 mt-2">{data.note}</p>
    </div>
  );
}

const MOCK_METRICS: Metrics = {
  model: "VajraNet v1.0",
  evaluation_period: "Jun-Sep 2023",
  metrics: {
    CSI_30dBZ_60min: 0.38,
    POD_30dBZ_60min: 0.72,
    FAR_30dBZ_60min: 0.34,
    HSS_30dBZ_60min: 0.41,
    Brier_lightning: 0.09,
    baseline_persistence_CSI: 0.15,
    baseline_optflow_CSI: 0.23,
  },
  note: "Metrics on withheld test events. SYNTHETIC mode — not real operational scores.",
};
