"use client";

import { useSyncExternalStore } from "react";

type SaveDataConnection = EventTarget & { saveData?: boolean };

function connection(): SaveDataConnection | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: SaveDataConnection })
    .connection;
}

/** True when the visitor asked the browser to save data. */
export function readSaveData(): boolean {
  return connection()?.saveData === true;
}

/**
 * Save-Data gate for decorative effects. `serverValue` defaults to the
 * conservative "saving data" so SSR/hydration render no effect.
 */
export function useSaveData(serverValue = true): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const c = connection();
      c?.addEventListener?.("change", onChange);
      return () => c?.removeEventListener?.("change", onChange);
    },
    readSaveData,
    () => serverValue
  );
}
