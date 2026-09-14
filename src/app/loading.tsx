"use client";

import dynamic from "next/dynamic";
import DecorativeEffectBoundary from "@/components/DecorativeEffectBoundary";
import { useMediaQuery } from "@/lib/use-media-query";

const UplinkLoader = dynamic(
  () =>
    import("@designcodeio/threeui/components/UplinkLoader").then(
      ({ UplinkLoader }) => UplinkLoader
    ),
  { ssr: false, loading: () => null }
);

export default function Loading() {
  const enabled = !useMediaQuery("(prefers-reduced-motion: reduce)", true);

  return (
    <div className="cosmic-page cosmic-page--shell min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="uplink-loader-wrap" role="status" aria-label="Loading">
        <DecorativeEffectBoundary>
          {enabled ? <UplinkLoader /> : null}
        </DecorativeEffectBoundary>
        <span className="sr-only">Loading…</span>
      </div>
      <p className="uplink-loader-label">Establishing uplink</p>
    </div>
  );
}
