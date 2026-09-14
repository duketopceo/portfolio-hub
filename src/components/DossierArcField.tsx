"use client";

import dynamic from "next/dynamic";
import DecorativeEffectBoundary from "@/components/DecorativeEffectBoundary";
import { useMediaQuery } from "@/lib/use-media-query";

const PredictiveArcCanvas = dynamic(
  () =>
    import("@designcodeio/threeui/components/PredictiveArcCanvas").then(
      ({ PredictiveArcCanvas }) => PredictiveArcCanvas
    ),
  { ssr: false, loading: () => null }
);

/**
 * Trajectory arcs behind the dossier hero — survey-chart telemetry lines.
 * Disabled under reduced motion; the hero reads fine without it.
 */
export default function DossierArcField() {
  const enabled = !useMediaQuery("(prefers-reduced-motion: reduce)", true);

  if (!enabled) return null;

  return (
    <DecorativeEffectBoundary>
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
    </DecorativeEffectBoundary>
  );
}
