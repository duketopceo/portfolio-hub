"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type { EnrichedProject } from "@/lib/types";
import {
  LAB_ORBIT_RING_SPEED,
  LAB_ORBIT_RX,
  LAB_ORBIT_RY,
  type LabOrbitPlanet,
  type LabOrbitRing,
} from "@/lib/lab-orbit-rings";
import { planetSizeScale, resolvePlanetVisual } from "@/lib/planet-visual";
import { useMediaQuery } from "@/lib/use-media-query";
import styles from "./orbit-lab.module.css";

const VIEW = 400;
const CENTER = VIEW / 2;

type ClientPlanet = LabOrbitPlanet & {
  id: string;
  px: number;
  py: number;
  radius: number;
  color: string;
  href: string;
};

function planetRadius(project: EnrichedProject, ring: LabOrbitRing): number {
  const tier = ring === "inner" ? "primary" : "secondary";
  const visual = resolvePlanetVisual(project, tier);
  return 7 * planetSizeScale(visual.size);
}

function positionOnEllipse(
  ring: LabOrbitRing,
  angle: number,
  compact: boolean
): { px: number; py: number } {
  const key: LabOrbitRing = compact && ring === "outer" ? "middle" : ring;
  const rx = LAB_ORBIT_RX[key];
  const ry = LAB_ORBIT_RY[key];
  return {
    px: CENTER + rx * Math.cos(angle),
    py: CENTER + ry * Math.sin(angle),
  };
}

export interface OrbitLabSceneProps {
  planets: LabOrbitPlanet[];
}

export function OrbitLabScene({ planets }: OrbitLabSceneProps) {
  const baseId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compact = useMediaQuery("(max-width: 520px)");
  const [angles, setAngles] = useState<Record<string, number>>(() =>
    Object.fromEntries(planets.map((p) => [p.project.slug, p.baseAngle]))
  );
  const [paused, setPaused] = useState<Set<string>>(() => new Set());
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const startRef = useRef<number | null>(null);
  const frozenRef = useRef<Record<string, number>>({});

  const ringDefs = useMemo(() => {
    const rings: LabOrbitRing[] = compact
      ? ["inner", "middle"]
      : ["inner", "middle", "outer"];
    return rings.map((ring) => ({
      ring,
      rx: LAB_ORBIT_RX[ring],
      ry: LAB_ORBIT_RY[ring],
    }));
  }, [compact]);

  const clientPlanets: ClientPlanet[] = useMemo(
    () =>
      planets
        .filter((p) => !(compact && p.ring === "outer"))
        .map((p) => {
          const angle = reducedMotion
            ? p.baseAngle
            : (angles[p.project.slug] ?? p.baseAngle);
          const { px, py } = positionOnEllipse(p.ring, angle, compact);
          const visual = resolvePlanetVisual(
            p.project,
            p.ring === "inner" ? "primary" : "secondary"
          );
          return {
            ...p,
            id: `${baseId}-${p.project.slug}`,
            px: (px / VIEW) * 100,
            py: (py / VIEW) * 100,
            radius: planetRadius(p.project, p.ring),
            color: visual.color,
            href: `/projects/${p.project.slug}`,
          };
        }),
    [planets, angles, compact, baseId, reducedMotion]
  );

  useEffect(() => {
    if (reducedMotion) return;
    startRef.current = null;
    frozenRef.current = {};
    let frame = 0;
    const loop = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const t = now - startRef.current;
      setAngles((prev) => {
        const next = { ...prev };
        const pausedNow = pausedRef.current;
        for (const p of planets) {
          if (pausedNow.has(p.project.slug)) {
            if (frozenRef.current[p.project.slug] === undefined) {
              frozenRef.current[p.project.slug] = prev[p.project.slug] ?? p.baseAngle;
            }
            next[p.project.slug] = frozenRef.current[p.project.slug];
            continue;
          }
          const speed = LAB_ORBIT_RING_SPEED[p.ring];
          next[p.project.slug] = p.baseAngle + t * speed;
        }
        return next;
      });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, planets]);

  const setPause = useCallback((slug: string, on: boolean) => {
    setPaused((prev) => {
      const next = new Set(prev);
      if (on) next.add(slug);
      else {
        next.delete(slug);
        delete frozenRef.current[slug];
      }
      return next;
    });
  }, []);

  const onPlanetKeyDown = useCallback(
    (event: KeyboardEvent, slug: string) => {
      if (event.key === "Escape") {
        setPause(slug, false);
        setActiveSlug(null);
        (event.currentTarget as HTMLElement).blur();
      }
    },
    [setPause]
  );

  return (
    <div ref={stageRef} data-visual-mask>
    <div
      className={`${styles.stage} ${compact ? styles.stageCompact : ""}`.trim()}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        role="img"
        aria-label="Elliptical orbits with the portfolio at the center and projects as planets"
      >
        {ringDefs.map(({ ring, rx, ry }) => (
          <ellipse
            key={ring}
            className={`${styles.orbitGuide} ${ring === "outer" ? styles.orbitOuter : ""}`.trim()}
            cx={CENTER}
            cy={CENTER}
            rx={rx}
            ry={ry}
          />
        ))}
        <circle className={styles.sun} cx={CENTER} cy={CENTER} r={28} />
        <text className={styles.sunLabel} x={CENTER} y={CENTER}>
          Luke
        </text>
      </svg>

      <div className={styles.planets} aria-hidden={false}>
        {clientPlanets.map((p) => {
          const active = activeSlug === p.project.slug;
          const showCard = active || paused.has(p.project.slug);
          return (
            <div
              key={p.project.slug}
              className={styles.planetWrap}
              style={{ left: `${p.px}%`, top: `${p.py}%` }}
            >
              <Link
                href={p.href}
                className={styles.planetLink}
                data-active={active ? "true" : undefined}
                aria-label={`${p.project.displayName}. ${p.project.description}`}
                onMouseEnter={() => setPause(p.project.slug, true)}
                onMouseLeave={() => {
                  setPause(p.project.slug, false);
                  if (activeSlug !== p.project.slug) setActiveSlug(null);
                }}
                onFocus={() => {
                  setPause(p.project.slug, true);
                  setActiveSlug(p.project.slug);
                }}
                onBlur={() => {
                  setPause(p.project.slug, false);
                  setActiveSlug((cur) => (cur === p.project.slug ? null : cur));
                }}
                onKeyDown={(e) => onPlanetKeyDown(e, p.project.slug)}
              >
                {showCard ? (
                  <div className={styles.card} role="tooltip">
                    <p className={styles.cardTitle}>{p.project.displayName}</p>
                    <p className={styles.cardDesc}>{p.project.description}</p>
                  </div>
                ) : null}
                <span
                  className={styles.planetBody}
                  style={
                    {
                      width: p.radius * 2,
                      height: p.radius * 2,
                      background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${p.color} 90%, white), ${p.color})`,
                      "--planet-color": p.color,
                    } as CSSProperties
                  }
                />
              </Link>
            </div>
          );
        })}
      </div>
    </div>

      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: "var(--color-accent)" }} />
          Featured orbit
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ opacity: 0.7 }} />
          Active systems
        </span>
        {!compact ? (
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ opacity: 0.45 }} />
            Plugins &amp; tools
          </span>
        ) : null}
      </div>
    </div>
  );
}
