"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { CAPABILITY_IDS, capabilityMeta, type CapabilityId } from "@/data/capability-meta";
import { useMediaQuery } from "@/lib/use-media-query";
import type { SphereProject } from "@/lib/sphere-projects";
import {
  latitudeLine,
  layoutSphere,
  meridianLine,
  projectPoint,
  wirePaths,
} from "@/lib/sphere-layout";

const SIZE = 400;
const C = SIZE / 2;
const R = 176;
/** Radians per second: a full turn in about two minutes. */
const SPIN = (2 * Math.PI) / 120;
const START_PHI = (-24 * Math.PI) / 180;
const LATITUDES = [-60, -30, 0, 30, 60].map((d) => (d * Math.PI) / 180);
/** Every 24 degrees, so the five 72-degree sector edges are among them. */
const MERIDIANS = Array.from({ length: 15 }, (_, i) => (i * 24 * Math.PI) / 180);
const EDGE_MERIDIANS = new Set([0, 3, 6, 9, 12]);

/**
 * A quiet wireframe sphere of every listed project: one longitude sector per
 * capability group, one small dot per project. Plain SVG (KTD3), turned slowly
 * unless reduced motion is on. Every dot is a link; the grouped list below the
 * legend names the same projects for keyboard and screen-reader use.
 */
export default function ProjectSphere({
  projects,
  variant = "full",
}: {
  projects: readonly SphereProject[];
  /** `compact` shrinks the sphere for home and hides the visible list. */
  variant?: "full" | "compact";
}) {
  const dots = useMemo(() => layoutSphere(projects, CAPABILITY_IDS), [projects]);
  const [phi, setPhi] = useState(START_PHI);
  const [active, setActive] = useState<string | null>(null);
  const hovering = useRef(false);
  const activeRef = useRef<string | null>(null);
  // Touch only: the dot a first tap has named; a second tap on it opens the dossier.
  const armedSlug = useRef<string | null>(null);
  const figureRef = useRef<HTMLElement | null>(null);
  const inView = useRef(true);
  // Server value true: the markup never assumes motion; the client reads the real setting.
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const coarsePointer = useMediaQuery("(pointer: coarse)");

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
    });
    observer.observe(figure);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    let last = performance.now();
    let lastPaint = last;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const paused = hovering.current || activeRef.current !== null || document.hidden || !inView.current;
      // Paint at about 30 frames per second; the sphere is slow and small.
      if (!paused && now - lastPaint >= 33) {
        lastPaint = now;
        setPhi((p) => p + SPIN * Math.min(dt, 0.25));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  const wires = useMemo(
    () => [
      ...LATITUDES.map((lat) => ({ points: latitudeLine(lat), edge: false })),
      ...MERIDIANS.map((lon, i) => ({ points: meridianLine(lon), edge: EDGE_MERIDIANS.has(i) })),
    ],
    []
  );

  const placed = dots
    .map((d) => ({ d, q: projectPoint(d, phi) }))
    .sort((a, b) => a.q.z - b.q.z);
  const activeDot = placed.find((p) => p.d.slug === active) ?? null;

  const groups = useMemo(
    () =>
      CAPABILITY_IDS.map((id) => ({
        id,
        meta: capabilityMeta[id],
        members: projects.filter((p) => p.capability === id).sort((a, b) => a.rank - b.rank),
      })),
    [projects]
  );

  return (
    <figure ref={figureRef} className={`project-sphere project-sphere--${variant}`}>
      <svg
        className="project-sphere__svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="group"
        aria-label="Map of projects by capability. Each dot opens a project."
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") hovering.current = true;
        }}
        onPointerLeave={(e) => {
          // Touch lifts fire pointerleave before click; only a mouse leaving clears the label.
          if (e.pointerType !== "mouse") return;
          hovering.current = false;
          setActive(null);
        }}
        onPointerDown={(e) => {
          // A touch outside every dot disarms the two-tap flow.
          if (e.pointerType !== "mouse" && !(e.target as Element).closest("a")) {
            armedSlug.current = null;
            setActive(null);
          }
        }}
      >
        <circle className="project-sphere__limb" cx={C} cy={C} r={R} />
        <g aria-hidden="true">
          {wires.map((w, i) => {
            const { front, back } = wirePaths(w.points, phi, R, C, C);
            return (
              <g key={i}>
                <path
                  className={`project-sphere__wire project-sphere__wire--back${w.edge ? " project-sphere__wire--edge" : ""}`}
                  d={back}
                />
                <path
                  className={`project-sphere__wire${w.edge ? " project-sphere__wire--edge" : ""}`}
                  d={front}
                />
              </g>
            );
          })}
        </g>
        {placed.map(({ d, q }) => {
          const meta = capabilityMeta[d.capability as CapabilityId];
          const front = q.z >= 0;
          // Rounded so server and browser Math.sin/cos agree on the markup.
          const px = Number((C + R * q.x).toFixed(1));
          const py = Number((C + R * q.y).toFixed(1));
          const radius = d.lead ? 5.2 : 3.4;
          return (
            <Link
              key={d.slug}
              href={`/projects/${d.slug}`}
              prefetch={false}
              className="project-sphere__dot"
              aria-label={`${d.name}, ${meta.label}`}
              data-umami-event="sphere-dot-open"
              data-umami-event-slug={d.slug}
              onFocus={() => setActive(d.slug)}
              onBlur={() => setActive((a) => (a === d.slug ? null : a))}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setActive(d.slug);
              }}
              onClick={(e) => {
                // On touch the first tap names the dot; the second opens it.
                if (coarsePointer && armedSlug.current !== d.slug) {
                  e.preventDefault();
                  armedSlug.current = d.slug;
                  setActive(d.slug);
                }
              }}
            >
              <circle className="project-sphere__hit" cx={px} cy={py} r={hitRadius(variant)} />
              <circle
                className="project-sphere__point"
                cx={px}
                cy={py}
                r={radius}
                fill={meta.color}
                opacity={front ? 1 : 0.32}
              />
            </Link>
          );
        })}
        {activeDot && <SphereLabel x={C + R * activeDot.q.x} y={C + R * activeDot.q.y} text={activeDot.d.name} />}
      </svg>

      <figcaption className="project-sphere__caption">
        <Legend groups={groups} />
        <GroupedList groups={groups} variant={variant} />
      </figcaption>
    </figure>
  );
}

/**
 * Transparent hit circle radius in viewBox units, sized so the target stays
 * at least 24 CSS px wide where the sphere renders (full about 1:1, compact
 * about 0.6:1).
 */
function hitRadius(variant: "full" | "compact"): number {
  return variant === "compact" ? 20 : 12;
}

function SphereLabel({ x, y, text }: { x: number; y: number; text: string }) {
  const width = Math.max(40, text.length * 6.6 + 14);
  const left = x > C;
  const lx = left ? x - 10 - width : x + 10;
  return (
    <g className="project-sphere__label" pointerEvents="none" aria-hidden="true">
      <rect x={lx} y={y - 11} width={width} height={22} rx={3} />
      <text x={lx + width / 2} y={y + 4} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

type Group = {
  id: CapabilityId;
  meta: { label: string; color: string };
  members: readonly SphereProject[];
};

/** Static between frames, so it skips the rotation re-render. */
const Legend = memo(function Legend({ groups }: { groups: readonly Group[] }) {
  return (
    <ul className="project-sphere__legend" aria-label="Capability groups">
      {groups.map(({ id, meta, members }) => (
        <li key={id} className="project-sphere__legend-item">
          <span
            className="project-sphere__swatch"
            style={{ background: meta.color }}
            aria-hidden="true"
          />
          <span className="project-sphere__legend-label">{meta.label}</span>
          <span className="project-sphere__legend-count">{members.length}</span>
        </li>
      ))}
    </ul>
  );
});

const GroupedList = memo(function GroupedList({
  groups,
  variant,
}: {
  groups: readonly Group[];
  variant: "full" | "compact";
}) {
  const body = (
    <div className="project-sphere__list">
      {groups.map(({ id, meta, members }) => (
        <section key={id} aria-labelledby={`sphere-list-${variant}-${id}`}>
          <h3 id={`sphere-list-${variant}-${id}`}>{meta.label}</h3>
          <ul>
            {members.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/projects/${p.slug}`}
                  prefetch={false}
                  // The compact list is read by screen readers only; the dots are the keyboard path.
                  tabIndex={variant === "compact" ? -1 : undefined}
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
  if (variant === "compact") {
    return <div className="sr-only">{body}</div>;
  }
  return (
    <details className="project-sphere__details">
      <summary>All projects by capability</summary>
      {body}
    </details>
  );
});
