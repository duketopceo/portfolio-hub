"use client";

import { UplinkLoader } from "@designcodeio/threeui/components/UplinkLoader";

export default function Loading() {
  return (
    <div className="cosmic-page cosmic-page--shell min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="uplink-loader-wrap" role="status" aria-label="Loading">
        <UplinkLoader />
        <span className="sr-only">Loading…</span>
      </div>
      <p className="uplink-loader-label">Establishing uplink</p>
    </div>
  );
}
