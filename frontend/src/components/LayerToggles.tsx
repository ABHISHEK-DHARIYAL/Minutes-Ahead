"use client";

interface LayerTogglesProps {
  activeLayers: Record<string, boolean>;
  onToggle: (layer: string) => void;
}

const LAYERS = [
  { id: "radar",     label: "Radar",     icon: "📡", color: "#06B6D4" },
  { id: "satellite", label: "Satellite", icon: "🛰️", color: "#A78BFA" },
  { id: "lightning", label: "Lightning", icon: "⚡", color: "#FCD34D" },
  { id: "nwp",       label: "NWP Model", icon: "🌀", color: "#34D399" },
];

export default function LayerToggles({ activeLayers, onToggle }: LayerTogglesProps) {
  return (
    <div className="glass-panel p-3">
      <div className="text-xs font-semibold text-slate-400 mb-2">FUSION LAYERS</div>
      <div className="grid grid-cols-2 gap-1.5">
        {LAYERS.map(layer => (
          <button
            key={layer.id}
            onClick={() => onToggle(layer.id)}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeLayers[layer.id] ? `${layer.color}1A` : "transparent",
              border: `1px solid ${activeLayers[layer.id] ? layer.color : "rgba(255,255,255,0.06)"}`,
              color: activeLayers[layer.id] ? layer.color : "#64748B",
            }}
          >
            <span>{layer.icon}</span>
            <span>{layer.label}</span>
            <span className="ml-auto" style={{ opacity: activeLayers[layer.id] ? 1 : 0.3 }}>
              {activeLayers[layer.id] ? "●" : "○"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
