"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string>) => void };
  }
}

/**
 * Delegated tracker for actions Umami's attribute hooks can't cover cleanly:
 * outbound links and file downloads. Elements carrying their own
 * data-umami-event win — this skips them so explicit events stay canonical.
 */
export default function UmamiOutbound() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!anchor || anchor.hasAttribute("data-umami-event")) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!window.umami) return;
      if (/^https?:\/\//.test(href) && !href.startsWith(location.origin)) {
        window.umami.track("outbound-link", {
          url: new URL(href).host,
          from: location.pathname,
        });
      } else if (/\.pdf($|\?)/i.test(href)) {
        window.umami.track("resume-download", { format: "pdf", from: location.pathname });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
