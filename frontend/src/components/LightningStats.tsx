"use client";

interface LightningStatsProps {
  strikes: { lat: number; lon: number; t: number }[];
}

export default function LightningStats({ strikes }: LightningStatsProps) {
  const last10m = strikes.filter(s => Date.now() - s.t < 10 * 60 * 1000);
  const last1m  = strikes.filter(s => Date.now() - s.t < 60 * 1000);

  return (
    <div className="glass-panel p-3">
      <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
        ⚡ LIGHTNING LIVE
        <span className="ml-auto text-[10px] font-mono text-amber-400 animate-pulse">● LIVE</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-xl font-black text-amber-400">{last1m.length}</div>
          <div className="text-[10px] text-slate-500">last 1 min</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-xl font-black text-amber-300">{last10m.length}</div>
          <div className="text-[10px] text-slate-500">last 10 min</div>
        </div>
      </div>
      {strikes.slice(-3).reverse().map((s, i) => (
        <div key={i} className="mt-1 text-[10px] text-slate-600 font-mono flex items-center gap-2">
          <span className="text-amber-500">⚡</span>
          <span>{s.lat.toFixed(2)}°N {s.lon.toFixed(2)}°E</span>
          <span className="ml-auto">{Math.round((Date.now() - s.t) / 1000)}s ago</span>
        </div>
      ))}
      {strikes.length === 0 && (
        <p className="text-[10px] text-slate-600 text-center mt-1">Waiting for strikes…</p>
      )}
    </div>
  );
}
