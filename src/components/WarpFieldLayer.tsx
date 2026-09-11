"use client";

import { useEffect, useState } from "react";
import { WarpFieldBackground } from "@designcodeio/threeui/components/WarpFieldBackground";

/**
 * Hyperspace streaks for the 404 plate — the "off-chart" visual.
 * Disabled under reduced motion; static chart grid remains.
 */
export default function WarpFieldLayer() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setEnabled(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!enabled) return null;

  return (
    <div className="nf-warp" aria-hidden="true">
      <WarpFieldBackground
        variant="hyperspace"
        speed={0.8}
        streakOpacity={0.5}
        fov={70}
        brightness={0.7}
        saturation={0.4}
      />
    </div>
  );
}
