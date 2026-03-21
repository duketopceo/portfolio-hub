"use client";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import type { EnrichedProject } from "@/lib/types";
import { categoryMeta } from "@/data/projects";

/** Ellipse radii (rem) — wide orbit, perspective-ish; mobile tightened via hook */
function useOrbitRadiiRem() {
  const [radii, setRadii] = useState({ rx: 23, ry: 11.5 });
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () =>
      setRadii(mq.matches ? { rx: 13.5, ry: 6.75 } : { rx: 23, ry: 11.5 });
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return radii;
}

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
  /** +1 = next (card enters from right), -1 = prev (from left) — drives 3D snap */
  const [flipDir, setFlipDir] = useState(1);
  const n = projects.length;
  const { rx, ry } = useOrbitRadiiRem();

  const orbitOffsets = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const theta = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
      return {
        x: rx * Math.cos(theta),
        y: ry * Math.sin(theta),
      };
    });
  }, [n, rx, ry]);

  useEffect(() => {
    setFocusIndex((i) => {
      if (n === 0) return 0;
      return Math.min(i, n - 1);
    });
  }, [n]);

  const go = useCallback(
    (delta: number) => {
      if (n === 0) return;
      setFlipDir(delta > 0 ? 1 : -1);
      setFocusIndex((i) => (i + delta + n) % n);
    },
    [n]
  );

  /** Orbit hover / keyboard: pick shortest path for card flip direction */
  const moveFocusTo = useCallback(
    (i: number) => {
      setFocusIndex((prev) => {
        if (i === prev) return prev;
        const forward = (i - prev + n) % n;
        const backward = (prev - i + n) % n;
        setFlipDir(forward <= backward ? 1 : -1);
        return i;
      });
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
      className="solar-system solar-section home-solar"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-labelledby="solar-system-heading"
    >
      <div className="cosmic-page solar-system__intro">
        <h2 id="solar-system-heading" className="solar-system__heading">
          Mission systems
        </h2>
        <p className="solar-system__hint">
          Arrow keys or ‹ › to cycle. Click a planet or the dossier card to open a
          project.
        </p>
      </div>

      <div className="solar-system__stage solar-system__stage--universe">
        <div className="solar-orbit-decor" aria-hidden>
          <svg
            className="solar-orbit-decor__svg"
            viewBox="0 0 400 260"
            preserveAspectRatio="xMidYMid meet"
          >
            <ellipse
              className="solar-orbit-line solar-orbit-line--a"
              cx="200"
              cy="130"
              rx="188"
              ry="94"
            />
            <ellipse
              className="solar-orbit-line solar-orbit-line--b"
              cx="200"
              cy="130"
              rx="148"
              ry="74"
            />
            <ellipse
              className="solar-orbit-line solar-orbit-line--c"
              cx="200"
              cy="130"
              rx="108"
              ry="54"
            />
          </svg>
        </div>

        <div className="solar-sun-stack" aria-hidden>
          <div className="solar-sun solar-sun--halo" />
          <div className="solar-sun solar-sun--core" />
        </div>

        <div className="solar-planets">
          {projects.map((p, i) => {
            const { x, y } = orbitOffsets[i] ?? { x: 0, y: 0 };
            const isFocused = i === focusIndex;
            const c = catColors[p.category] || "#2DD4BF";
            return (
              <div
                key={p.slug}
                className="solar-planet-arm"
                style={{
                  transform: `translate(${x}rem, ${y}rem)`,
                }}
              >
                <Link
                  href={`/projects/${p.slug}`}
                  className={`solar-planet${isFocused ? " solar-planet--focused" : ""}`}
                  style={{ "--planet-accent": c } as React.CSSProperties}
                  onMouseEnter={() => moveFocusTo(i)}
                  onFocus={() => moveFocusTo(i)}
                >
                  <span className="solar-planet__dot" aria-hidden />
                  <span className="solar-planet__label">{p.displayName}</span>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="solar-center solar-center--deck">
          <button
            type="button"
            className="solar-nav-btn solar-nav-btn--prev"
            onClick={() => go(-1)}
            aria-label="Previous project in completeness order"
          >
            ‹
          </button>

          <div
            key={focused.slug}
            className="solar-focus-card-rotator"
            style={{ "--solar-flip-dir": flipDir } as React.CSSProperties}
          >
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
          </div>

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
