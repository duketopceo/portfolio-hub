"use client";

import { useCallback, useRef, useState } from "react";
import { PerformanceMonitor } from "@react-three/drei";
import { parseTierPin } from "@/lib/cosmos-mode";
import SceneFrame from "@/components/scene/SceneFrame";
import CosmosScene, { CAMERA_Z } from "@/components/scene/CosmosScene";
import {
  DECLINE_BELOW_FPS,
  stepDown,
  tierSettings,
  type CosmosTier,
} from "@/lib/cosmos-quality";

/**
 * The live background: one SceneFrame (one WebGL context) holding the scene,
 * watched by drei's PerformanceMonitor. Sustained frames under budget step
 * quality down (high -> low) and then give the stage back to the static plate
 * via `onGiveUp`; it never steps back up. The scene is imported statically
 * here on purpose: next/dynamic inside an R3F Canvas hands the custom
 * reconciler a lazy wrapper that calls React's use(), which throws React
 * error #438 and kills the canvas.
 */
export default function CosmosLive({
  onReadyChange,
  onTierChange,
  onGiveUp,
}: {
  onReadyChange: (ready: boolean) => void;
  onTierChange: (tier: CosmosTier) => void;
  onGiveUp: () => void;
}) {
  const [tier, setTier] = useState<CosmosTier>("full");
  // QA only: ?cosmos-tier=pin holds full quality and skips the monitor.
  const [pinned] = useState(() => parseTierPin(window.location.search));
  const tierRef = useRef<CosmosTier>("full");

  const decline = useCallback(
    (fps: number) => {
      const current = tierRef.current;
      const next = stepDown(current);
      if (next === current) return;
      tierRef.current = next;
      console.info(`[cosmos] tier ${current} -> ${next} at ${Math.round(fps)} fps (budget ${DECLINE_BELOW_FPS})`);
      setTier(next);
      onTierChange(next);
      if (next === "plate") onGiveUp();
    },
    [onTierChange, onGiveUp]
  );

  return (
    <SceneFrame
      className="cosmic-bg__field"
      camera={{ position: [0, 0, CAMERA_Z], fov: 50 }}
      dpr={tierSettings(tier).dpr}
      preserveDrawingBuffer={false}
      onReadyChange={onReadyChange}
    >
      {!pinned && (
        <PerformanceMonitor
          bounds={() => [DECLINE_BELOW_FPS, 1000]}
          onDecline={(api) => decline(api.fps)}
        />
      )}
      <CosmosScene tier={tier} />
    </SceneFrame>
  );
}
