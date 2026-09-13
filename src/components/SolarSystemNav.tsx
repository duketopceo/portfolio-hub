"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  type KeyboardEvent,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { EnrichedProject } from "@/lib/types";
import { catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import { useMediaQuery } from "@/lib/use-media-query";
import { PlanetNode } from "@/components/planet/PlanetNode";

const SceneFrame = dynamic(() => import("@/components/scene/SceneFrame"), {
  ssr: false,
});
const OrbitalScene = dynamic(
  () => import("@/components/scene/OrbitalScene"),
  { ssr: false }
);

/** Ellipse radii (rem) for the live scene — widen slightly when orbit is
 *  crowded. The SSR plate mirrors these values via CSS --orbit-rx/--orbit-ry
 *  on .solar-planets in globals.css — keep the two in sync. */
function useOrbitRadiiRem(count: number) {
  const mobile = useMediaQuery("(max-width: 640px)");
  const crowded = count > 18;
  if (mobile) return crowded ? { rx: 10, ry: 5.5 } : { rx: 8.5, ry: 4.5 };
  return crowded ? { rx: 25, ry: 12.5 } : { rx: 23, ry: 11.5 };
}

interface SolarSystemNavProps {
  projects: EnrichedProject[];
  /** Registry numbers aligned to `projects` — source-order catalog position. */
  registryIndexOf?: number[];
}

export default function SolarSystemNav({ projects, registryIndexOf }: SolarSystemNavProps) {
  const [focus, setFocus] = useState({ index: 0, dir: 1 });
  const [sceneReady, setSceneReady] = useState(false);
  const plateRef = useRef<HTMLDivElement | null>(null);
  const n = projects.length;
  const { rx, ry } = useOrbitRadiiRem(n);

  // Unitless direction cosines — SSR-stable (pure function of index/count);
  // the plate multiplies them by CSS --orbit-rx/--orbit-ry so its geometry
  // is viewport-correct without hydration.
  const orbitDirs = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const theta = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
      return { x: Math.cos(theta), y: Math.sin(theta) };
    });
  }, [n]);

  const safeFocusIndex = n === 0 ? 0 : ((focus.index % n) + n) % n;
  const flipDir = focus.dir;

  const go = useCallback(
    (delta: number) => {
      if (n === 0) return;
      setFocus((f) => ({
        index: (f.index + delta + n) % n,
        dir: delta > 0 ? 1 : -1,
      }));
    },
    [n]
  );

  const moveFocusTo = useCallback(
    (i: number) => {
      setFocus((f) => {
        if (i === f.index) return f;
        const forward = (i - f.index + n) % n;
        const backward = (f.index - i + n) % n;
        return { index: i, dir: forward <= backward ? 1 : -1 };
      });
    },
    [n]
  );

  // Live overlay marker matching a plate link's href (null until drei
  // <Html> portal content lands — a commit or two after the first frame).
  const findLiveMarker = useCallback((href: string | null | undefined) => {
    if (!href) return null;
    return (
      plateRef.current?.parentElement?.querySelector<HTMLElement>(
        `.scene-overlay a[href="${href}"]`
      ) ?? null
    );
  }, []);

  // Plate -> scene swap: hide the plate only once live overlay markers
  // exist in the DOM. If focus is inside the plate at swap time, move it
  // to the same project's live marker before hiding; if that focus can't
  // land, defer hiding until focus leaves the plate.
  const handleReadyChange = useCallback((ready: boolean) => {
    if (!ready) {
      setSceneReady(false);
      return;
    }
    const plate = plateRef.current;
    const stage = plate?.parentElement;
    if (!plate || !stage) {
      setSceneReady(true);
      return;
    }
    const overlayHasMarkers = () =>
      !!stage.querySelector('.scene-overlay a[href^="/projects/"]');
    const commit = () => {
      const active = document.activeElement as HTMLElement | null;
      if (active && plate.contains(active)) {
        const liveMarker = findLiveMarker(
          active.closest("a")?.getAttribute("href")
        );
        liveMarker?.focus();
        // If the marker refused (or was absent), keep the plate until
        // focus leaves rather than hiding a focused element.
        if (document.activeElement === liveMarker) {
          setSceneReady(true);
          return;
        }
        const onFocusOut = () => {
          if (!plate.contains(document.activeElement)) {
            plate.removeEventListener("focusout", onFocusOut);
            setSceneReady(true);
          }
        };
        plate.addEventListener("focusout", onFocusOut);
        return;
      }
      setSceneReady(true);
    };
    if (overlayHasMarkers()) {
      commit();
      return;
    }
    let tries = 0;
    const poll = () => {
      if (overlayHasMarkers()) {
        commit();
        return;
      }
      if (++tries > 120) return; // markers never mounted: keep the plate
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
  }, [findLiveMarker]);

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

  // Same node in the SSR plate and the live overlay — identical semantics
  // so the plate→scene swap is invisible to focus and tab order.
  const renderPlanet = (p: EnrichedProject, i: number) => (
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
  );

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
          {n} lead bodies under survey. Arrow keys or ‹ › to cycle —
          select a marker for the survey file.
        </p>
      </div>

      <div
        className={`solar-system__stage solar-system__stage--universe${
          n > 18 ? " solar-system__stage--crowded" : ""
        }`}
      >
        {/* Server-rendered static plate — present in SSR HTML before the
            scene chunk resolves; hidden once the live scene reports its
            first frame, re-shown if the scene is later lost. */}
        <div
          ref={plateRef}
          className={`solar-plate${sceneReady ? " solar-plate--hidden" : ""}`}
          onFocusCapture={(e) => {
            // The --hidden visibility transition keeps the plate focusable
            // for ~300ms after the swap; relocate any late-arriving focus
            // to the same project's live marker instead of letting it die
            // on a hidden element.
            if (!sceneReady) return;
            findLiveMarker(
              (e.target as HTMLElement).closest("a")?.getAttribute("href")
            )?.focus();
          }}
        >
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
              const { x, y } = orbitDirs[i] ?? { x: 0, y: 0 };
              return (
                <div
                  key={p.slug}
                  className="solar-planet-arm"
                  style={
                    {
                      "--orbit-x": x.toFixed(4),
                      "--orbit-y": y.toFixed(4),
                      "--planet-index": i,
                    } as React.CSSProperties
                  }
                >
                  {renderPlanet(p, i)}
                </div>
              );
            })}
          </div>
        </div>

        <SceneFrame
          className={`solar-scene${sceneReady ? " solar-scene--ready" : ""}`}
          camera={{ position: [0, 16, 30], fov: 32 }}
          onReadyChange={handleReadyChange}
        >
          <OrbitalScene
            projects={projects}
            focusIndex={safeFocusIndex}
            rx={rx}
            rz={ry}
            renderMarker={renderPlanet}
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
