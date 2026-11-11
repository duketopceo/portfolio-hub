"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";
import { useCosmosMode } from "@/components/cosmos/use-cosmos-mode";
import type { CosmosTier } from "@/lib/cosmos-quality";

const CosmosLive = dynamic(() => import("@/components/cosmos/CosmosLive"), {
  ssr: false,
});

/** Footer is passed as a server-rendered child so the catalog stays out of the client bundle. */
export function SiteFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/podcast")) return null;
  return <>{children}</>;
}

/**
 * Site background: one full-screen black hole and nothing else. The static
 * plate (SVG still of the same composition) is server-rendered and is what
 * first paint, reduced motion, and every WebGL failure show. After first
 * paint, when the visitor allows motion and WebGL is not a named software
 * rasteriser, the live scene mounts on top (one WebGL context, via
 * SceneFrame) and the plate steps aside only once its first frame has
 * rendered. If the scene is lost the plate comes back; if the frame rate
 * stays under budget the scene steps its quality down and then gives up for
 * the rest of the visit (`data-cosmos-tier` records the rung).
 */
export function SiteBackground({ plate }: { plate: ReactNode }) {
  const pathname = usePathname();
  const mode = useCosmosMode();
  const [sceneReady, setSceneReady] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [tier, setTier] = useState<CosmosTier>("full");
  // CosmosLive reports the tier before giving up, so the attribute ends on "plate".
  const onGiveUp = useCallback(() => setGaveUp(true), []);
  const live = mode === "live" && !gaveUp;
  if (pathname?.startsWith("/podcast")) return null;
  return (
    <div
      className="cosmic-bg"
      aria-hidden="true"
      data-cosmos={live ? "live" : "static"}
      data-scene={live && sceneReady ? "live" : "plate"}
      data-cosmos-tier={mode === "live" ? tier : undefined}
    >
      {plate}
      {live ? (
        <CosmosLive onReadyChange={setSceneReady} onTierChange={setTier} onGiveUp={onGiveUp} />
      ) : null}
      <div className="cosmic-bg__noise" />
      <div className="cosmic-bg__scrim" />
      <div className="cosmic-bg__vignette" />
    </div>
  );
}
