"use client";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  type KeyboardEvent,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { EnrichedProject } from "@/lib/types";
import { catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import { PlanetNode } from "@/components/planet/PlanetNode";

const SceneFrame = dynamic(() => import("@/components/scene/SceneFrame"), {
  ssr: false,
});
const OrbitalScene = dynamic(
  () => import("@/components/scene/OrbitalScene"),
  { ssr: false }
);

/** Ellipse radii (rem) — widen slightly when orbit is crowded */
function useOrbitRadiiRem(count: number) {
  const [radii, setRadii] = useState({ rx: 23, ry: 11.5 });
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => {
      const crowded = count > 18;
      if (mq.matches) {
        setRadii(crowded ? { rx: 10, ry: 5.5 } : { rx: 8.5, ry: 4.5 });
      } else {
        setRadii(crowded ? { rx: 25, ry: 12.5 } : { rx: 23, ry: 11.5 });
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [count]);
  return radii;
}

interface SolarSystemNavProps {
  projects: EnrichedProject[];
  /** Registry numbers aligned to `projects` — source-order catalog position. */
  registryIndexOf?: number[];
  variant?: "primary";
}

export default function SolarSystemNav({ projects, registryIndexOf }: SolarSystemNavProps) {
  const [focusIndex, setFocusIndex] = useState(0);
  const [flipDir, setFlipDir] = useState(1);
  const n = projects.length;
  const { rx, ry } = useOrbitRadiiRem(n);

  const orbitOffsets = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const theta = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
      return {
        x: rx * Math.cos(theta),
        y: ry * Math.sin(theta),
      };
    });
  }, [n, rx, ry]);

  const safeFocusIndex = n === 0 ? 0 : ((focusIndex % n) + n) % n;

  const go = useCallback(
    (delta: number) => {
      if (n === 0) return;
      setFlipDir(delta > 0 ? 1 : -1);
      setFocusIndex((i) => (i + delta + n) % n);
    },
    [n]
  );

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
        No repositories in orbit yet.
      </p>
    );
  }

  const focused = projects[safeFocusIndex];
  const meta = categoryMeta[focused.category];
  const accent = catColors[focused.category] || "#2DD4BF";

  return (
    <section
      className="solar-system solar-section home-solar solar-system--primary"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-labelledby="solar-system-heading"
    >
      <div className="cosmic-page solar-system__intro">
        <h2 id="solar-system-heading" className="solar-system__heading">
          <span className="reg-label reg-label--accent">Fig. 01</span> — Primary orbit
        </h2>
        <p className="solar-system__hint">
          Five lead bodies under survey. Arrow keys or ‹ › to cycle —
          select a marker for the survey file.
        </p>
      </div>

      <div className="solar-system__stage solar-system__stage--universe">
        <SceneFrame
          className="solar-scene"
          camera={{ position: [0, 16, 30], fov: 32 }}
          fallback={
            <>
              {/* Static plate — reduced motion / no WebGL */}
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
              <div className="solar-planets" aria-hidden={false}>
                {projects.map((p, i) => {
                  const { x, y } = orbitOffsets[i] ?? { x: 0, y: 0 };
                  const isFocused = i === safeFocusIndex;
                  return (
                    <div
                      key={p.slug}
                      className="solar-planet-arm"
                      style={
                        {
                          transform: `translate(${x.toFixed(4)}rem, ${y.toFixed(4)}rem)`,
                          "--planet-index": i,
                        } as React.CSSProperties
                      }
                    >
                      <PlanetNode
                        project={p}
                        tier="primary"
                        href={`/projects/${p.slug}`}
                        focused={isFocused}
                        index={registryIndexOf?.[i] ?? i}
                        onMouseEnter={() => moveFocusTo(i)}
                        onFocus={() => moveFocusTo(i)}
                        tabIndex={isFocused ? 0 : -1}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          }
        >
          <OrbitalScene
            projects={projects}
            focusIndex={safeFocusIndex}
            rx={rx}
            rz={ry}
            renderMarker={(p, i) => (
              <PlanetNode
                project={p}
                tier="primary"
                href={`/projects/${p.slug}`}
                focused={i === safeFocusIndex}
                index={registryIndexOf?.[i] ?? i}
                onMouseEnter={() => moveFocusTo(i)}
                onFocus={() => moveFocusTo(i)}
                tabIndex={i === safeFocusIndex ? 0 : -1}
              />
            )}
          />
        </SceneFrame>

        <div className="solar-center solar-center--deck">
          <button
            type="button"
            className="solar-nav-btn solar-nav-btn--prev"
            onClick={() => go(-1)}
            aria-label="Previous project in orbit order"
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
              className="solar-focus-card corner-ticks corner-ticks--accent"
              style={{ "--focus-accent": accent } as React.CSSProperties}
            >
              <span className="solar-focus-card__top">
                <span className="solar-focus-card__eyebrow">
                  {meta?.label ?? focused.category}
                </span>
                <span className="solar-focus-card__id">
                  CI-{String((registryIndexOf?.[safeFocusIndex] ?? safeFocusIndex) + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="solar-focus-card__title">{focused.displayName}</span>
              <span className="solar-focus-card__tagline">{focused.tagline}</span>
              <span className="solar-focus-card__cta">Open survey file →</span>
            </Link>
          </div>

          <button
            type="button"
            className="solar-nav-btn solar-nav-btn--next"
            onClick={() => go(1)}
            aria-label="Next project in orbit order"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
