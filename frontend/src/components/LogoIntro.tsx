"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function LogoIntro({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050A14]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Lightning bolt that forms the logo */}
      <motion.div
        className="relative w-40 h-40 flex items-center justify-center"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Glow rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-cyan-400/30"
            style={{ width: 40 * i, height: 40 * i }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.5, delay: 0.3 + i * 0.15, repeat: Infinity, repeatDelay: 1 }}
          />
        ))}

        {/* Lightning bolt SVG */}
        <motion.svg viewBox="0 0 80 100" className="w-24 h-24 drop-shadow-[0_0_30px_#7C3AED]"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <defs>
            <linearGradient id="bolt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <motion.path
            d="M55 5 L20 45 H42 L25 95 L75 38 H52 L65 5 Z"
            fill="url(#bolt-grad)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
        </motion.svg>
      </motion.div>

      {/* Title */}
      <motion.div
        className="mt-6 text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <h1 className="text-5xl font-black tracking-tight"
          style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4, #F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          VAJRANET
        </h1>
        <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase">
          AI Storm Nowcasting
        </p>
      </motion.div>

      {/* Loading bar */}
      <motion.div className="mt-8 w-48 h-0.5 bg-white/10 rounded overflow-hidden">
        <motion.div
          className="h-full rounded"
          style={{ background: "linear-gradient(90deg, #7C3AED, #06B6D4)" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.p className="text-slate-600 text-xs mt-3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        Ministry of Earth Sciences · IMD · SIH 2024
      </motion.p>
    </motion.div>
  );
}
