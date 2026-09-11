"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

const StarChartField = dynamic(() => import("@/components/StarChartField"), {
  ssr: false,
});

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
      <StarChartField />
      <div className="cosmic-bg__grid" />
      <div className="cosmic-bg__stars cosmic-bg__stars--far" />
      <div className="cosmic-bg__noise" />
      <div className="cosmic-bg__vignette" />
    </div>
  );
}
