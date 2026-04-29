"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

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
      <div className="cosmic-bg__nebula" />
      <div className="cosmic-bg__nebula cosmic-bg__nebula--accent" />
      <div className="cosmic-bg__stars cosmic-bg__stars--near" />
      <div className="cosmic-bg__stars cosmic-bg__stars--mid" />
      <div className="cosmic-bg__stars cosmic-bg__stars--far" />
    </div>
  );
}
