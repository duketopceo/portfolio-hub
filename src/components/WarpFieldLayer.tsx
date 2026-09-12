"use client";

import { WarpFieldBackground } from "@designcodeio/threeui/components/WarpFieldBackground";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Hyperspace streaks for the 404 plate — the "off-chart" visual.
 * Disabled under reduced motion; static chart grid remains.
 */
export default function WarpFieldLayer() {
  const enabled = !useMediaQuery("(prefers-reduced-motion: reduce)", true);

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
