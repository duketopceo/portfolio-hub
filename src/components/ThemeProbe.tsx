"use client";

import { useEffect } from "react";

const STORE_KEY = "r2-theme";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Local-only contrast switch (KTD5): `?theme=ink|paper` sets `data-theme` on
 * <html> so both treatments can be screenshotted. It does nothing on any
 * other host. Removed, with the losing token set, once Luke picks.
 */
export default function ThemeProbe() {
  useEffect(() => {
    if (!LOCAL_HOSTS.has(window.location.hostname)) return;
    let theme = new URLSearchParams(window.location.search).get("theme");
    try {
      if (theme === "ink" || theme === "paper") {
        sessionStorage.setItem(STORE_KEY, theme);
      } else {
        theme = sessionStorage.getItem(STORE_KEY);
      }
    } catch {
      // Storage can be blocked; the query string alone still works.
    }
    if (theme === "ink" || theme === "paper") {
      document.documentElement.dataset.theme = theme;
    }
  }, []);
  return null;
}
