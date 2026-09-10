"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

/** Card with a radial brand highlight that follows the cursor. */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect || !ref.current) return;
        ref.current.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        ref.current.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        "before:bg-[radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklch,var(--brand)_11%,transparent),transparent_65%)]",
        className
      )}
    >
      {children}
    </div>
  );
}
