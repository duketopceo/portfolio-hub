"use client";

import dynamic from "next/dynamic";
import DecorativeEffectBoundary from "@/components/DecorativeEffectBoundary";
import { useMediaQuery } from "@/lib/use-media-query";
import { useSaveData } from "@/lib/use-save-data";

const WarpFieldBackground = dynamic(
  () =>
    import("@designcodeio/threeui/components/WarpFieldBackground").then(
      ({ WarpFieldBackground }) => WarpFieldBackground
    ),
  { ssr: false, loading: () => null }
);

/**
 * Slow star-streak field behind the /hire header. Purely decorative: absent
 * under reduced motion and Save-Data, aria-hidden, never carries meaning.
 */
export default function HireBackdrop() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const saveData = useSaveData(true);

  if (reducedMotion || saveData) return null;

  return (
    <DecorativeEffectBoundary>
      <div className="hire-backdrop" aria-hidden="true">
        <WarpFieldBackground
          variant="streaks"
          speed={3}
          streakOpacity={0.35}
          fov={70}
          brightness={0.6}
          saturation={0.4}
        />
      </div>
    </DecorativeEffectBoundary>
  );
}
