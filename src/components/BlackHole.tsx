"use client";

import { motion } from "motion/react";

export default function BlackHole({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={`relative ${className || ""}`}>
      {/* Event horizon */}
      <div
        className="absolute inset-[25%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #0a0a0a 10%, #000 60%, transparent 100%)",
          boxShadow:
            "0 0 80px 30px color-mix(in oklch, var(--primary) 12%, transparent)",
        }}
      />

      {/* Rotating accretion ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 12%, color-mix(in oklch, var(--primary) 55%, transparent) 18%, color-mix(in oklch, var(--primary) 25%, transparent) 26%, transparent 40%)",
          maskImage:
            "radial-gradient(circle, transparent 58%, black 60%, black 70%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 58%, black 60%, black 70%, transparent 72%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />

      {/* Counter-rotating inner flare */}
      <motion.div
        className="absolute inset-[12%] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 30%, color-mix(in oklch, var(--primary) 40%, transparent) 40%, transparent 50%)",
          maskImage:
            "radial-gradient(circle, transparent 66%, black 68%, black 76%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 66%, black 68%, black 76%, transparent 78%)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      {/* Hot photon sphere */}
      <div
        className="absolute inset-[20%] rounded-full animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, transparent 58%, color-mix(in oklch, var(--primary) 25%, transparent) 65%, transparent 72%)",
        }}
      />
    </div>
  );
}
