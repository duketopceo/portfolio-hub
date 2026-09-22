"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string>) => void };
  }
}

const SCROLL_THRESHOLDS = [25, 50, 75, 100];
const DEEP_PAGE = /^\/(projects|demos)\//;

/**
 * Delegated tracker for actions Umami's attribute hooks can't cover cleanly:
 * outbound links, file downloads, scroll depth, and dossier section
 * impressions. Elements carrying their own data-umami-event win — this
 * skips them so explicit events stay canonical.
 */
export default function UmamiOutbound() {
  const pathname = usePathname();

  useEffect(() => {
    const track = (event: string, data?: Record<string, string>) =>
      window.umami?.track(event, data);

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!anchor || anchor.hasAttribute("data-umami-event")) return;
      const href = anchor.getAttribute("href") ?? "";
      if (/^https?:\/\//.test(href) && !href.startsWith(location.origin)) {
        track("outbound-link", {
          url: new URL(href).host,
          from: location.pathname,
        });
      } else if (/\.pdf($|\?)/i.test(href)) {
        track("resume-download", { format: "pdf", from: location.pathname });
      }
    };
    document.addEventListener("click", onClick, true);

    const cleanups: Array<() => void> = [
      () => document.removeEventListener("click", onClick, true),
    ];

    if (DEEP_PAGE.test(pathname)) {
      const fired = new Set<number>();
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const doc = document.documentElement;
          const max = doc.scrollHeight - doc.clientHeight;
          if (max <= 0) return;
          const pct = (doc.scrollTop / max) * 100;
          for (const t of SCROLL_THRESHOLDS) {
            if (pct >= t && !fired.has(t)) {
              fired.add(t);
              track("scroll-depth", { depth: String(t), page: pathname });
            }
          }
          if (fired.size === SCROLL_THRESHOLDS.length)
            document.removeEventListener("scroll", onScroll);
        });
      };
      document.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => {
        document.removeEventListener("scroll", onScroll);
        if (raf) cancelAnimationFrame(raf);
      });

      const seen = new WeakSet<Element>();
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target)) continue;
          seen.add(entry.target);
          io.unobserve(entry.target);
          const section = entry.target.getAttribute("data-umami-section");
          if (section)
            track("dossier-section-view", { page: pathname, section });
        }
      });
      document
        .querySelectorAll("[data-umami-section]")
        .forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
