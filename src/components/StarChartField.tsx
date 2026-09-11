"use client";

import { useEffect, useState } from "react";
import { ConstellationField } from "@designcodeio/threeui/components/ConstellationField";

/**
 * Living star-chart layer — animated constellation canvas that sits under
 * the survey grid/noise/vignette. Skipped entirely under reduced motion;
 * the static CSS star layers remain as the fallback texture.
 */
export default function StarChartField() {
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
    <div className="cosmic-bg__field">
      <ConstellationField
        variant="constellation-field"
        mode="dark"
        speed={0.45}
        density={0.7}
        opacity={0.4}
        saturation={0.5}
        brightness={0.8}
      />
    </div>
  );
}
