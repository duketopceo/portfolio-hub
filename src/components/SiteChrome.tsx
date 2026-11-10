"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useCosmosMode } from "@/components/cosmos/use-cosmos-mode";

const CosmosLive = dynamic(() => import("@/components/cosmos/CosmosLive"), {
  ssr: false,
});
const StardustCanvas = dynamic(
  () => import("@/components/cosmos/StardustCanvas"),
  { ssr: false }
);

/** Footer is passed as a server-rendered child so the catalog stays out of the client bundle. */
export function SiteFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/podcast")) return null;
  return <>{children}</>;
}

/**
 * Site background. The static plate (SVG black hole, three planets, CSS
 * stardust) is server-rendered and is what first paint, reduced motion, and
 * every WebGL failure show. After first paint, when the visitor allows motion
 * and a real GPU context exists, the live scene mounts on top (one WebGL
 * context, via SceneFrame) and the plate steps aside only once its first
 * frame has rendered; if the scene is lost, the plate comes back.
 */
export function SiteBackground({
  plate,
  dust,
}: {
  plate: ReactNode;
  dust: ReactNode;
}) {
  const pathname = usePathname();
  const mode = useCosmosMode();
  const [sceneReady, setSceneReady] = useState(false);
  const live = mode === "live";
  const home = pathname === "/";
  const [scrollable, setScrollable] = useState(false);
  // Stardust only on pages long enough to scroll.
  useEffect(() => {
    const measure = () =>
      setScrollable(document.documentElement.scrollHeight > window.innerHeight * 1.25);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [pathname]);
  if (pathname?.startsWith("/podcast")) return null;
  return (
    <div
      className="cosmic-bg"
      aria-hidden="true"
      data-cosmos={live ? "live" : "static"}
      data-scene={live && sceneReady ? "live" : "plate"}
      data-home={home ? "true" : "false"}
      data-scrollable={scrollable ? "true" : "false"}
    >
      {plate}
      <div className="cosmos-dust" data-dust={live ? "live" : "static"}>
        {dust}
        {live && scrollable ? <StardustCanvas /> : null}
      </div>
      {live ? (
        <CosmosLive planets={home} onReadyChange={setSceneReady} />
      ) : null}
      <div className="cosmic-bg__grid" />
      <div className="cosmic-bg__stars cosmic-bg__stars--far" />
      <div className="cosmic-bg__noise" />
      <div className="cosmic-bg__vignette" />
    </div>
  );
}
