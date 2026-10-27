"use client";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  Component,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { EnrichedProject } from "@/lib/types";
import { catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/category-meta";
import { useMediaQuery } from "@/lib/use-media-query";
import { PlanetNode } from "@/components/planet/PlanetNode";
import { orbitRadiiRem } from "@/components/scene/orbit-layout";
import {
  TOUR_INTERVAL_MS,
  swipeDirection,
  tourReducer,
  tourShouldAdvance,
} from "@/components/scene/orbit-tour";

const SceneFrame = dynamic(() => import("@/components/scene/SceneFrame"), {
  ssr: false,
});
const OrbitalScene = dynamic(
  () => import("@/components/scene/OrbitalScene"),
  { ssr: false }
);

/** Contains a failed scene chunk load. SceneFrame's own boundary only sees
 *  errors thrown by an already-loaded scene, so without this a rejected
 *  dynamic import reaches the segment boundary and replaces the page. On
 *  failure we render nothing and leave the SSR plate in place. */
class SceneLoadBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useStageRadiiRem(stageRef: { current: HTMLDivElement | null }) {
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setWidth(el.clientWidth);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageRef]);
  return width === null ? orbitRadiiRem(1280) : orbitRadiiRem(width);
}

/** True while the element intersects the viewport (optimistic until measured). */
function useInView(ref: { current: HTMLElement | null }) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

interface SolarSystemNavProps {
  projects: EnrichedProject[];
  /** Registry numbers aligned to `projects` — source-order catalog position. */
  registryIndexOf?: number[];
  /** Server-rendered hero copy, placed beside the stage on wide screens. */
  children?: ReactNode;
}

export default function SolarSystemNav({ projects, registryIndexOf, children }: SolarSystemNavProps) {
  const [focus, setFocus] = useState({ index: 0, dir: 1 });
  const [sceneReady, setSceneReady] = useState(false);
  const plateRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const motionOk = !useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const inView = useInView(sectionRef);
  const [tour, dispatchTour] = useReducer(tourReducer, "running");
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  // Teardown for a deferred swap: the focusout listener waiting for focus to
  // leave the plate. Cleared when the scene reports not-ready and on unmount,
  // so a scene that dies mid-handoff can never re-hide the plate over itself.
  const pendingSwapRef = useRef<(() => void) | null>(null);
  // The rAF poll that waits for overlay markers; cancelled with the swap so a
  // scene lost mid-poll can never hide the plate afterwards.
  const pollRafRef = useRef<number | null>(null);
  const n = projects.length;
  const { rx, ry } = useStageRadiiRem(stageRef);

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
  const clearPendingSwap = useCallback(() => {
    pendingSwapRef.current?.();
    pendingSwapRef.current = null;
    if (pollRafRef.current !== null) {
      cancelAnimationFrame(pollRafRef.current);
      pollRafRef.current = null;
    }
  }, []);

  useEffect(() => clearPendingSwap, [clearPendingSwap]);

  const handleReadyChange = useCallback(
    (ready: boolean) => {
      clearPendingSwap();
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
          const onFocusOut = (e: FocusEvent) => {
            if (!plate.contains(e.relatedTarget as Node | null)) {
              clearPendingSwap();
              setSceneReady(true);
            }
          };
          plate.addEventListener("focusout", onFocusOut);
          pendingSwapRef.current = () =>
            plate.removeEventListener("focusout", onFocusOut);
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
        pollRafRef.current = null;
        if (overlayHasMarkers()) {
          commit();
          return;
        }
        if (++tries > 120) return; // markers never mounted: keep the plate
        pollRafRef.current = requestAnimationFrame(poll);
      };
      pollRafRef.current = requestAnimationFrame(poll);
    },
    [clearPendingSwap, findLiveMarker]
  );

  // Tour: advance focus on a timer while every gate is open. Changing focus
  // here only updates state; it never moves DOM focus.
  const engaged = pointerInside || focusInside;
  useEffect(() => {
    if (!tourShouldAdvance({ state: tour, inView, engaged, motionOk })) return;
    const id = window.setInterval(() => go(1), TOUR_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [tour, inView, engaged, motionOk, go]);

  // Marker link for project i: the live overlay once the scene owns the
  // stage, otherwise the SSR plate.
  const markerFor = useCallback(
    (i: number) => {
      const href = `/projects/${projects[i]?.slug}`;
      const root = sectionRef.current;
      if (!root) return null;
      const live = root.querySelector<HTMLElement>(`.scene-overlay a[href="${href}"]`);
      return live ?? root.querySelector<HTMLElement>(`.solar-plate a[href="${href}"]`);
    },
    [projects]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const delta = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
      if (delta === 0 || n === 0) return;
      e.preventDefault();
      go(delta);
      // Arrow keys on a marker move DOM focus with the selection, so the
      // roving tab stop and the focused element never diverge.
      if ((e.target as HTMLElement).closest(".planet-node")) {
        const next = (safeFocusIndex + delta + n) % n;
        requestAnimationFrame(() => markerFor(next)?.focus());
      }
    },
    [go, n, safeFocusIndex, markerFor]
  );

  // Any use of the map ends the tour; the tour's own button does not.
  const onInteract = useCallback((e: { target: EventTarget }) => {
    if ((e.target as HTMLElement).closest?.("[data-tour-control]")) return;
    dispatchTour("interact");
  }, []);

  const onStagePointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    swipe.current =
      e.pointerType === "mouse" ? null : { x: e.clientX, y: e.clientY };
  };
  const onStagePointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dir = swipeDirection(e.clientX - start.x, e.clientY - start.y);
    if (dir === 0) return;
    go(dir);
    // The gesture can end on a marker link; swallow the click that follows.
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 350);
  };

  if (n === 0) {
    return (
      <section className="poster">
        <div className="poster__copy">{children}</div>
        <p className="solar-empty" role="status">
          No repositories in orbit yet.
        </p>
      </section>
    );
  }

  const focused = projects[safeFocusIndex];
  const meta = categoryMeta[focused.category];
  const accent = catColors[focused.category] || "#2DD4BF";
  const focusedNumber = (registryIndexOf?.[safeFocusIndex] ?? safeFocusIndex) + 1;

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
      ref={sectionRef}
      className="poster solar-system solar-system--primary"
      onKeyDown={onKeyDown}
      onKeyDownCapture={onInteract}
      onPointerDownCapture={onInteract}
      onTouchStartCapture={onInteract}
      onFocusCapture={(e) =>
        // Only the map itself counts as "engaged"; the tour's own button and
        // the readout controls must not hold the tour back after Play.
        setFocusInside(!!(e.target as HTMLElement).closest(".planet-node"))
      }
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocusInside(false);
        }
      }}
      aria-labelledby="solar-system-heading"
    >
      <h2 id="solar-system-heading" className="sr-only">
        Lead systems orbit map
      </h2>

      <div className="poster__copy">{children}</div>

      <div
        ref={stageRef}
        role="group"
        aria-label="Lead systems, one marker per project"
        className="solar-system__stage solar-system__stage--universe"
        onPointerEnter={() => setPointerInside(true)}
        onPointerLeave={() => setPointerInside(false)}
        onPointerDown={onStagePointerDown}
        onPointerUp={onStagePointerUp}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <span className="solar-system__fig" aria-hidden="true">
          Fig. 01 · Lead systems
        </span>
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
            <span className="solar-orbit-ring solar-orbit-ring--a" />
            <span className="solar-orbit-ring solar-orbit-ring--b" />
            <span className="solar-orbit-ring solar-orbit-ring--c" />
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
                      "--arm-i": i,
                      // Light comes from the map centre: the lit half of the
                      // plate disc faces it, matching the scene's shader.
                      "--light-angle": `${Math.round(
                        (Math.atan2(-x, y) * 180) / Math.PI
                      )}deg`,
                    } as React.CSSProperties
                  }
                >
                  {renderPlanet(p, i)}
                </div>
              );
            })}
          </div>
        </div>

        <SceneLoadBoundary>
          <SceneFrame
            className={`solar-scene${sceneReady ? " solar-scene--ready" : ""}`}
            camera={{ position: [0, 18, 26], fov: 32 }}
            onReadyChange={handleReadyChange}
          >
            <OrbitalScene
              projects={projects}
              focusIndex={safeFocusIndex}
              rx={rx}
              rz={ry * 1.7}
              renderMarker={renderPlanet}
            />
          </SceneFrame>
        </SceneLoadBoundary>
      </div>

      <div className="poster__readout">
        {/* Announce card changes only when the visitor caused them. */}
        <div
          className="solar-card-live"
          aria-live={tour === "running" ? "off" : "polite"}
        >
          <div
            key={focused.slug}
            className="solar-focus-card-rotator"
            style={{ "--solar-flip-dir": flipDir } as React.CSSProperties}
          >
            <Link
              href={`/projects/${focused.slug}`}
              className="solar-focus-card corner-ticks corner-ticks--accent"
              style={{ "--focus-accent": accent } as React.CSSProperties}
              data-umami-event="survey-file-open"
              data-umami-event-slug={focused.slug}
              data-umami-event-source="orbit-card"
            >
              <span className="solar-focus-card__top">
                <span className="solar-focus-card__eyebrow">
                  {meta?.label ?? focused.category}
                </span>
                <span className="solar-focus-card__id">
                  CI-{String(focusedNumber).padStart(2, "0")}
                </span>
              </span>
              <span className="solar-focus-card__title">{focused.displayName}</span>
              <span className="solar-focus-card__tagline">{focused.tagline}</span>
              <span className="solar-focus-card__cta">Open survey file →</span>
            </Link>
          </div>
        </div>

        <div className="poster__readout-meta">
          <button
            type="button"
            className="solar-nav-btn solar-nav-btn--prev"
            onClick={() => go(-1)}
            aria-label="Previous project in orbit order"
          >
            ‹
          </button>
          <span className="poster__count" aria-hidden="true">
            {String(safeFocusIndex + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="solar-nav-btn solar-nav-btn--next"
            onClick={() => go(1)}
            aria-label="Next project in orbit order"
          >
            ›
          </button>
          {/* Hidden by CSS under reduced motion, so SSR and hydration agree. */}
          <button
            type="button"
            className="poster__tour"
            data-tour-control
            onClick={() => dispatchTour(tour === "running" ? "pause" : "play")}
          >
            {tour === "running" ? "Pause tour" : "Play tour"}
          </button>
          <span className="poster__hint">Arrow keys or swipe to move.</span>
        </div>
      </div>
    </section>
  );
}
