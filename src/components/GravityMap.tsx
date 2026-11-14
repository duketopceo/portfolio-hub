"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildGravityMap,
  centreOrbit,
  centrePositions,
  GROUP_EVENT,
  leadPositions,
  memberJitter,
  memberPositions,
  TALL_FRAME,
  WIDE_FRAME,
  type GravityInput,
} from "@/lib/gravity-map";
import type { CapabilityId } from "@/data/capability-meta";
import { useMediaQuery } from "@/lib/use-media-query";
import styles from "./gravity-map.module.css";

/** Radians per second of orbit phase: one slow turn in about two and a half minutes. */
const SPIN = (2 * Math.PI) / 150;
const FRAME_MS = 33;

/**
 * The gravity map: the five lead projects named at the centre, the capability
 * groups around them, every other project a quiet dot orbiting its group.
 * Clicking a group applies the /projects group filter. Plain SVG; the dots are
 * decorative for assistive tech because the lists below name every project.
 */
export default function GravityMap({ projects }: { projects: readonly GravityInput[] }) {
  const data = useMemo(() => buildGravityMap(projects), [projects]);
  const tall = useMediaQuery("(max-width: 640px)");
  const frame = tall ? TALL_FRAME : WIDE_FRAME;
  // Server value true: the markup never assumes motion; the client reads the real setting.
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);

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
    if (reduceMotion) return;
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
  }, [reduceMotion]);

  const centres = useMemo(() => centrePositions(data.centres.length, frame), [data.centres.length, frame]);
  const jitters = useMemo(
    () => data.centres.map((c, i) => memberJitter(c.members.length, i + 1)),
    [data.centres]
  );
  const orbit = centreOrbit(frame);
  const leads = leadPositions(data.heroes.length, frame, t);

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

  return (
    <figure ref={figureRef} className={styles.root} aria-label="Gravity map of projects by capability">
      <p className={styles.copy}>Five lead projects. Click a group to see the rest.</p>

      <svg
        className={styles.svg}
        viewBox={`0 0 ${frame.w} ${frame.h}`}
        role="group"
        aria-label="Lead projects at the centre, capability groups around them"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") holding.current = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          holding.current = false;
          setLabel(null);
        }}
      >
        <rect className={styles.backing} x={0} y={0} width={frame.w} height={frame.h} rx={4} aria-hidden="true" />
        <g aria-hidden="true" className={styles.orbits}>
          <ellipse
            cx={frame.w / 2}
            cy={frame.h / 2}
            rx={orbit.rx}
            ry={orbit.ry}
          />
        </g>

        {data.centres.map((c, ci) => {
          const pos = centres[ci];
          const dots = memberPositions(c.members.length, pos, t, jitters[ci]);
          const above = pos.y < frame.h / 2 - 1;
          const ly = above ? pos.y - 76 : pos.y + 86;
          // Keep the label inside the frame; a long name near an edge slides inward.
          const half = c.label.length * 4.4 + 8;
          const lx = Math.min(Math.max(pos.x, half), frame.w - half);
          return (
            <g key={c.id}>
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
                    <circle className={styles.point} cx={p.x} cy={p.y} r={3} fill={c.color} />
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
                <circle className={styles.hit} cx={pos.x} cy={pos.y} r={22} />
                <circle className={styles.core} cx={pos.x} cy={pos.y} r={8} fill={c.color} />
                <text className={styles.groupLabel} x={lx} y={ly} textAnchor="middle" fill={c.color}>
                  {c.label}
                </text>
                <text className={styles.groupCount} x={lx} y={ly + 15} textAnchor="middle">
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

      <ul className={styles.legend} aria-label="Capability groups">
        {data.centres.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={styles.legendButton}
              aria-pressed={selected === c.id}
              onClick={() => pick(c.id)}
            >
              <span className={styles.swatch} style={{ background: c.color }} aria-hidden="true" />
              {c.label}
              <span className={styles.legendCount}>{c.count}</span>
            </button>
          </li>
        ))}
      </ul>

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

      <details className={styles.details}>
        <summary>All projects by capability</summary>
        <div className={styles.list}>
          {data.centres.map((c) => (
            <section key={c.id} aria-labelledby={`gravity-list-${c.id}`}>
              <h3 id={`gravity-list-${c.id}`}>{c.label}</h3>
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
      </details>
    </figure>
  );
}
