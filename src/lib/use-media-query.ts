"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared matchMedia subscription via useSyncExternalStore — no
 * set-state-in-effect, no duplicate listeners per call site.
 * `serverValue` keeps SSR/hydration consistent; call sites here are
 * client-gated (`ssr: false`) or want the conservative value.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      // No matchMedia (older test DOMs): keep the server value.
      if (typeof window.matchMedia !== "function") return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () =>
      typeof window.matchMedia === "function" ? window.matchMedia(query).matches : serverValue,
    () => serverValue
  );
}
