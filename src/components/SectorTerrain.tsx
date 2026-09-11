"use client";

import { useEffect, useState } from "react";
import { ConstellationField } from "@designcodeio/threeui/components/ConstellationField";

/**
 * Animated topographic terrain under the sector map — the "surveyed ground"
 * the project nodes are plotted against. Static under reduced motion.
 */
export default function SectorTerrain() {
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
    <div className="q-terrain" aria-hidden="true">
      <ConstellationField
        variant="topo-field"
        mode="dark"
        speed={0.35}
        density={0.9}
        opacity={0.28}
        saturation={0.4}
        brightness={0.75}
      />
    </div>
  );
}
