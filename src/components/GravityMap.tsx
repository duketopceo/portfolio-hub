"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildGravityMap,
  centreOrbit,
  centrePositions,
  COUNT_DROP,
  GROUP_ACTIVE_EVENT,
  GROUP_EVENT,
  labelPlacement,
  leadPositions,
  memberJitter,
  memberPositions,
  memberScale,
  TALL_FRAME,
  WIDE_FRAME,
  type GravityFrame,
  type GravityInput,
} from "@/lib/gravity-map";
import type { CapabilityId } from "@/data/capability-meta";
import { useMediaQuery } from "@/lib/use-media-query";
import styles from "./gravity-map.module.css";

/**
 * Which frame fits: the tall one on phones and in any portrait window (words
 * above, map below), the wide one otherwise. Both are rendered and CSS picks
 * one with these same queries (gravity-map.module.css), so there is no flash
 * of the wrong map before hydration. Keep the two in step.
 */
const TALL_QUERY = "(max-width: 640px), (orientation: portrait)";

/** Hit radius of a group centre, frame units: 60 wide, about 44 CSS px at the smallest scale a frame is shown. */
const CENTRE_HIT = 30;

/** Radians per second of orbit phase: one slow turn in about two and a half minutes. */
const SPIN = (2 * Math.PI) / 150;
const FRAME_MS = 33;

/**
 * The gravity map: the five lead projects named at the centre, the capability
 * groups spread evenly around them, every other project a quiet dot orbiting
 * its group. Clicking a group applies the group filter on the project grid
 * (`#project-catalog`) and scrolls to it. Plain SVG; the dots are decorative
 * for assistive tech because the lists name every project.
 *
 * White thin lines on black, no accent colour: a group is told apart by where
 * it sits and by its name, the same language as the project cards. `landing` is the home page's map: it fills the height its parent gives it,
 * sits straight on the starfield (no panel behind it), and keeps the lists for
 * screen readers only. On phones both variants hold still, use short group
 * names and leave the lead names to the list of leads beside them.
 */
export default function GravityMap({
  projects,
  variant = "full",
}: {
  projects: readonly GravityInput[];
  variant?: "full" | "landing";
}) {
  const landing = variant === "landing";
  const data = useMemo(() => buildGravityMap(projects), [projects]);
  // Client-only reads, used for animation alone: the markup never depends on them.
  const tall = useMediaQuery(TALL_QUERY);
  // Server value true: the markup never assumes motion; the client reads the real setting.
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  // Touch devices hold still: no orbit loop on a battery.
  const coarse = useMediaQuery("(pointer: coarse)", true);
  const animate = !reduceMotion && !tall && !coarse;

  const [t, setT] = useState(0);
  const [selected, setSelected] = useState<CapabilityId | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const figureRef = useRef<HTMLElement | null>(null);
  const inView = useRef(true);
  const holding = useRef(false);

  useEffect(() => {
    const el = figureRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    let last = performance.now();
    let lastPaint = last;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;
      if (!holding.current && !document.hidden && inView.current && now - lastPaint >= FRAME_MS) {
        lastPaint = now;
        setT((p) => p + SPIN * dt);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  // The grid reports its active group (a pill, the URL, or a click here) so the map marks it.
  useEffect(() => {
    const onActive = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setSelected(data.centres.some((c) => c.id === id) ? (id as CapabilityId) : null);
    };
    window.addEventListener(GROUP_ACTIVE_EVENT, onActive);
    return () => window.removeEventListener(GROUP_ACTIVE_EVENT, onActive);
  }, [data.centres]);

  function pick(id: CapabilityId) {
    setSelected(id);
    window.dispatchEvent(new CustomEvent(GROUP_EVENT, { detail: id }));
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("group", id);
      window.history.replaceState(null, "", url);
    } catch {
      // The filter still applies without the shareable URL.
    }
    const catalog = document.getElementById("project-catalog");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    catalog?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  }

  const keyPick = (id: CapabilityId) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(id);
    }
  };

  const setHolding = (v: boolean) => {
    holding.current = v;
  };
  const mapProps = { data, landing, selected, label, setLabel, setHolding, pick, keyPick };

  const lists = (
    <div className={styles.list}>
      {data.centres.map((c) => (
        <section key={c.id} aria-labelledby={`gravity-list-${variant}-${c.id}`}>
          <h3 id={`gravity-list-${variant}-${c.id}`}>{c.label}</h3>
          <ul>
            {[...data.heroes.filter((h) => h.capability === c.id), ...c.members].map((m) => (
              <li key={m.slug}>
                <Link href={`/projects/${m.slug}`} prefetch={false}>
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );

  return (
    <figure
      ref={figureRef}
      className={`${styles.root}${landing ? ` ${styles.landing}` : ""}`}
      data-has-selection={selected ? "" : undefined}
      aria-label="Gravity map of projects by capability"
    >
      {!landing && <p className={styles.copy}>Five lead projects. Click a group to see the rest.</p>}

      <MapSvg {...mapProps} frame={WIDE_FRAME} tall={false} phase={animate ? t : 0} className={styles.svgWide} />
      <MapSvg {...mapProps} frame={TALL_FRAME} tall phase={0} className={styles.svgTall} />

      {!landing && (
        <ul className={styles.legend} aria-label="Capability groups">
          {data.centres.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={styles.legendButton}
                aria-pressed={selected === c.id}
                onClick={() => pick(c.id)}
              >
                <span className={styles.swatch} aria-hidden="true" />
                {c.label}
                <span className={styles.legendCount}>{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {landing ? (
        <div className="sr-only">{lists}</div>
      ) : (
        <>
          <ol className={styles.leads} aria-label="Lead projects">
            {data.heroes.map((h) => (
              <li key={h.slug}>
                <Link href={`/projects/${h.slug}`} prefetch={false} className={styles.leadLink}>
                  {h.name}
                </Link>
                <span className={styles.leadWhy}>{h.why}</span>
              </li>
            ))}
          </ol>
          <Link href="/projects/sphere" prefetch={false} className={styles.switch}>
            View as sphere
          </Link>
          <details className={styles.details}>
            <summary>All projects by capability</summary>
            {lists}
          </details>
        </>
      )}
    </figure>
  );
}

interface MapSvgProps {
  data: ReturnType<typeof buildGravityMap>;
  frame: GravityFrame;
  tall: boolean;
  landing: boolean;
  phase: number;
  className: string;
  selected: CapabilityId | null;
  label: string | null;
  setLabel: (slug: string | null) => void;
  setHolding: (v: boolean) => void;
  pick: (id: CapabilityId) => void;
  keyPick: (id: CapabilityId) => (e: React.KeyboardEvent) => void;
}

/**
 * One rendering of the map at one frame. The wide and tall maps are both in
 * the page; CSS shows exactly one (see TALL_QUERY). On touch the dots ignore
 * taps (the lists name every project and the filtered grid shows the group),
 * so a tap on a group is always a filter and no name is hover-only.
 */
function MapSvg({
  data,
  frame,
  tall,
  landing,
  phase,
  className,
  selected,
  label,
  setLabel,
  setHolding,
  pick,
  keyPick,
}: MapSvgProps) {
  const centres = useMemo(() => centrePositions(data.centres.length, frame), [data.centres.length, frame]);
  const jitters = useMemo(
    () => data.centres.map((c, i) => memberJitter(c.members.length, i + 1)),
    [data.centres]
  );
  const orbit = centreOrbit(frame);
  const scale = memberScale(frame);
  const leads = leadPositions(data.heroes.length, frame, phase);

  return (
    <svg
      className={`${styles.svg} ${className}`}
      viewBox={`0 0 ${frame.w} ${frame.h}`}
      role="group"
      aria-label="Lead projects at the centre, capability groups around them"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHolding(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        setHolding(false);
        setLabel(null);
      }}
    >
      {!landing && (
        <rect className={styles.backing} x={0} y={0} width={frame.w} height={frame.h} rx={4} aria-hidden="true" />
      )}
      <g aria-hidden="true" className={styles.orbits}>
        <ellipse cx={frame.w / 2} cy={frame.h / 2} rx={orbit.rx} ry={orbit.ry} />
      </g>

      {data.centres.map((c, ci) => {
        const pos = centres[ci];
        const dots = memberPositions(c.members.length, pos, phase, jitters[ci], scale);
        const text = tall ? c.short : c.label;
        const lp = labelPlacement(pos, frame, text);
        return (
          <g key={c.id} className={styles.cluster} data-selected={selected === c.id ? "" : undefined}>
            {dots.map((p, k) => {
              const m = c.members[k];
              return (
                <Link
                  key={m.slug}
                  href={`/projects/${m.slug}`}
                  prefetch={false}
                  tabIndex={-1}
                  aria-hidden="true"
                  className={styles.dot}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setLabel(m.slug);
                  }}
                >
                  <circle className={styles.hit} cx={p.x} cy={p.y} r={10} />
                  <circle className={styles.point} cx={p.x} cy={p.y} r={3} />
                  {label === m.slug && (
                    <text className={styles.hover} x={p.x} y={p.y - 9} textAnchor="middle">
                      {m.name}
                    </text>
                  )}
                </Link>
              );
            })}
            <g
              className={styles.centre}
              role="button"
              tabIndex={0}
              aria-pressed={selected === c.id}
              aria-label={`${c.label}, ${c.count} projects. Show this group.`}
              data-umami-event="gravity-group"
              data-umami-event-group={c.id}
              onClick={() => pick(c.id)}
              onKeyDown={keyPick(c.id)}
            >
              <circle className={styles.hit} cx={pos.x} cy={pos.y} r={CENTRE_HIT} />
              <circle className={styles.selectRing} cx={pos.x} cy={pos.y} r={14} />
              <circle className={styles.core} cx={pos.x} cy={pos.y} r={8} />
              <circle className={styles.coreDot} cx={pos.x} cy={pos.y} r={2.5} />
              <text className={styles.groupLabel} x={lp.x} y={lp.y} textAnchor="middle">
                {text}
              </text>
              <text className={styles.groupCount} x={lp.x} y={lp.y + COUNT_DROP} textAnchor="middle">
                {c.count} projects
              </text>
            </g>
          </g>
        );
      })}

      {data.heroes.map((h, i) => {
        const p = leads[i];
        return (
          <Link
            key={h.slug}
            href={`/projects/${h.slug}`}
            prefetch={false}
            className={styles.lead}
            aria-label={`${h.name}. ${h.why}`}
            data-umami-event="gravity-lead-open"
            data-umami-event-slug={h.slug}
          >
            <circle className={styles.hit} cx={p.x} cy={p.y} r={26} />
            <circle className={styles.leadRing} cx={p.x} cy={p.y} r={10} />
            <circle className={styles.leadCore} cx={p.x} cy={p.y} r={5} />
            <text className={styles.leadLabel} x={p.x} y={p.y + 26} textAnchor="middle">
              {h.name}
            </text>
          </Link>
        );
      })}
    </svg>
  );
}
