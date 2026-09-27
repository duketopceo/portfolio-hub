"use client";

import { useEffect } from "react";

/**
 * Delegated pointer tracker for the project-card scan light.
 * One listener; writes --torch-x/--torch-y on the hovered card so the
 * ::before sheen follows the cursor. Pure progressive enhancement —
 * cards render fine without it.
 */
export default function CardTorch() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.(
        ".cosmic-project-card"
      ) as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--torch-x", `${e.clientX - r.left}px`);
      card.style.setProperty("--torch-y", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
