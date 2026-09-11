"use client";

import { useEffect, useState } from "react";
import { PredictiveArcCanvas } from "@designcodeio/threeui/components/PredictiveArcCanvas";

/**
 * Trajectory arcs behind the dossier hero — survey-chart telemetry lines.
 * Disabled under reduced motion; the hero reads fine without it.
 */
export default function DossierArcField() {
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
    <div className="dossier-hero__arcs" aria-hidden="true">
      <PredictiveArcCanvas
        variant="predictive"
        mode="dark"
        speed={0.6}
        spacing={22}
        dotSize={1.6}
        archHeight={0.9}
        thickness={1.2}
        brightness={1.15}
        saturation={0.8}
      />
    </div>
  );
}
