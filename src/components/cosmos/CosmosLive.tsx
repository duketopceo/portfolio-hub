"use client";

import SceneFrame from "@/components/scene/SceneFrame";
import CosmosScene from "@/components/scene/CosmosScene";

/**
 * The live background: one SceneFrame (one WebGL context) holding the scene.
 * Loaded as a single lazy chunk by SiteBackground. The scene is imported
 * statically here on purpose: next/dynamic inside an R3F Canvas hands the
 * custom reconciler a lazy wrapper that calls React's use(), which throws
 * React error #438 and kills the canvas.
 */
export default function CosmosLive({
  planets,
  onReadyChange,
}: {
  planets: boolean;
  onReadyChange: (ready: boolean) => void;
}) {
  return (
    <SceneFrame
      className="cosmic-bg__field"
      camera={{ position: [0, 0, 42], fov: 50 }}
      dpr={[1, 1.25]}
      onReadyChange={onReadyChange}
    >
      <CosmosScene planets={planets} />
    </SceneFrame>
  );
}
