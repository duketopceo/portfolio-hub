"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

const SceneFrame = dynamic(() => import("@/components/scene/SceneFrame"), {
  ssr: false,
});
const StarfieldScene = dynamic(
  () => import("@/components/scene/StarfieldScene"),
  { ssr: false }
);

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/podcast")) return null;
  return <Footer />;
}

export function SiteBackground() {
  const pathname = usePathname();
  if (pathname?.startsWith("/podcast")) return null;
  return (
    <div className="cosmic-bg" aria-hidden="true">
      <SceneFrame
        className="cosmic-bg__field"
        camera={{ position: [0, 0, 42], fov: 50 }}
      >
        <StarfieldScene />
      </SceneFrame>
      <div className="cosmic-bg__grid" />
      <div className="cosmic-bg__stars cosmic-bg__stars--far" />
      <div className="cosmic-bg__noise" />
      <div className="cosmic-bg__vignette" />
    </div>
  );
}
