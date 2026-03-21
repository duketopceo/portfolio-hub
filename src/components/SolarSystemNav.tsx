"use client";

import { useState, useCallback, useEffect, type KeyboardEvent } from "react";
import Link from "next/link";
import type { EnrichedProject } from "@/lib/types";
import { categoryMeta } from "@/data/projects";

interface SolarSystemNavProps {
  projects: EnrichedProject[];
}

const catColors: Record<string, string> = {
  finance: "#2DD4BF",
  ai: "#A78BFA",
  osint: "#FBBF24",
  data: "#38BDF8",
  infra: "#F472B6",
  apps: "#34D399",
};

export default function SolarSystemNav({ projects }: SolarSystemNavProps) {
  const [focusIndex, setFocusIndex] = useState(0);
  const n = projects.length;

  useEffect(() => {
    setFocusIndex((i) => {
      if (n === 0) return 0;
      return Math.min(i, n - 1);
    });
  }, [n]);

  const go = useCallback(
    (delta: number) => {
      if (n === 0) return;
      setFocusIndex((i) => (i + delta + n) % n);
    },
    [n]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    },
    [go]
  );

  if (n === 0) {
    return (
      <p className="solar-empty" role="status">
        No projects to display.
      </p>
    );
  }

  const focused = projects[focusIndex];
  const meta = categoryMeta[focused.category];
  const accent = catColors[focused.category] || "#2DD4BF";

  return (
    <section
      className="cosmic-page solar-section solar-system"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-labelledby="solar-system-heading"
    >
      <h2 id="solar-system-heading" className="solar-system__heading">
        Mission systems
      </h2>
      <p className="solar-system__hint">
        Use arrow keys or buttons to cycle. Click a node or the card to open the
        project.
      </p>

      <div className="solar-system__stage">
        <div className="solar-sun" aria-hidden />
        <div className="solar-orbit-ring" aria-hidden />

        <div className="solar-planets">
          {projects.map((p, i) => {
            const deg = -90 + (360 / n) * i;
            const isFocused = i === focusIndex;
            const c = catColors[p.category] || "#2DD4BF";
            return (
              <div
                key={p.slug}
                className="solar-planet-arm"
                style={{
                  transform: `rotate(${deg}deg) translateY(calc(-1 * var(--solar-orbit-r))) rotate(${-deg}deg)`,
                }}
              >
                <Link
                  href={`/projects/${p.slug}`}
                  className={`solar-planet${isFocused ? " solar-planet--focused" : ""}`}
                  style={{ "--planet-accent": c } as React.CSSProperties}
                  onMouseEnter={() => setFocusIndex(i)}
                  onFocus={() => setFocusIndex(i)}
                >
                  <span className="solar-planet__dot" aria-hidden />
                  <span className="solar-planet__label">{p.displayName}</span>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="solar-center">
          <button
            type="button"
            className="solar-nav-btn solar-nav-btn--prev"
            onClick={() => go(-1)}
            aria-label="Previous project in completeness order"
          >
            ‹
          </button>

          <Link
            href={`/projects/${focused.slug}`}
            className="solar-focus-card"
            style={{ "--focus-accent": accent } as React.CSSProperties}
          >
            <span className="solar-focus-card__eyebrow">
              {meta?.label ?? focused.category}
            </span>
            <span className="solar-focus-card__title">{focused.displayName}</span>
            <span className="solar-focus-card__tagline">{focused.tagline}</span>
            <span className="solar-focus-card__cta">View dossier →</span>
          </Link>

          <button
            type="button"
            className="solar-nav-btn solar-nav-btn--next"
            onClick={() => go(1)}
            aria-label="Next project in completeness order"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
