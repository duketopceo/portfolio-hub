"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import { readDeviceMemory } from "@/lib/render-capability";
import { parseCosmosOverride, pickCosmosMode, type CosmosMode } from "@/lib/cosmos-mode";
import { probeWebGL } from "@/lib/webgl-probe";
import { readSaveData } from "@/lib/use-save-data";

/**
 * Which rendition the background should use. Starts "static" (what the
 * server rendered), then, after first paint and an idle moment, probes WebGL
 * and may upgrade to "live". Reduced motion always wins and can flip either
 * way at runtime.
 */
export function useCosmosMode(): CosmosMode {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const [probed, setProbed] = useState<CosmosMode | "pending">("pending");

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      setProbed(
        pickCosmosMode({
          // The live value is applied below; the probe is motion-agnostic.
          reducedMotion: false,
          webgl: probeWebGL(),
          saveData: readSaveData(),
          deviceMemory: readDeviceMemory(),
          override: parseCosmosOverride(window.location.search),
        })
      );
    };
    // After first paint: wait for load, then an idle slot.
    const schedule = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) ric(run, { timeout: 2000 });
      else window.setTimeout(run, 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
    };
  }, []);

  if (reducedMotion || probed === "pending") return "static";
  return probed;
}
