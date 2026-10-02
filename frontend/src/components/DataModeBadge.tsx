"use client";
import { DataMode } from "@/app/page";

interface DataModeBadgeProps {
  mode: DataMode;
  className?: string;
}

export default function DataModeBadge({ mode, className = "" }: DataModeBadgeProps) {
  const styles: Record<DataMode, { cls: string; icon: string; label: string }> = {
    LIVE:      { cls: "badge-live",   icon: "🟢", label: "LIVE" },
    REPLAY:    { cls: "badge-replay", icon: "🟡", label: "REPLAY" },
    SYNTHETIC: { cls: "badge-synth",  icon: "🟠", label: "SYNTHETIC" },
  };
  const { cls, icon, label } = styles[mode];

  return (
    <div className={`${cls} ${className} flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide`}>
      <span className="animate-pulse">{icon}</span>
      DATA MODE: {label}
    </div>
  );
}
