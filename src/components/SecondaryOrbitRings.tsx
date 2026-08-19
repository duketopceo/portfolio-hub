"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EnrichedProject } from "@/lib/types";
import { catColors } from "@/lib/utils";
import { LockIcon } from "@/components/Icons";

interface SecondaryOrbitRingsProps {
  projects: EnrichedProject[];
}

type RingId = "inner" | "outer";

function useRingRadii(ring: RingId) {
  const [radii, setRadii] = useState(
    ring === "inner" ? { rx: 26, ry: 13 } : { rx: 34, ry: 17 }
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => {
      if (mq.matches) {
        setRadii(
          ring === "inner" ? { rx: 10.5, ry: 5.25 } : { rx: 13.5, ry: 6.75 }
        );
      } else {
        setRadii(
          ring === "inner" ? { rx: 26, ry: 13 } : { rx: 34, ry: 17 }
        );
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [ring]);

  return radii;
}

function SecondaryRing({
  projects,
  ring,
  offsetRem,
}: {
  projects: EnrichedProject[];
  ring: RingId;
  offsetRem: { x: number; y: number };
}) {
  const n = projects.length;
  const { rx, ry } = useRingRadii(ring);

  const offsets = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const theta = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
      return {
        x: rx * Math.cos(theta),
        y: ry * Math.sin(theta),
      };
    });
  }, [n, rx, ry]);

  if (n === 0) return null;

  return (
    <div
      className={`secondary-orbit__ring secondary-orbit__ring--${ring}`}
      style={{
        transform: `translate(${offsetRem.x}rem, ${offsetRem.y}rem)`,
      }}
      aria-hidden={false}
    >
      <svg
        className="secondary-orbit__ellipse"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <ellipse
          cx="200"
          cy="100"
          rx={ring === "inner" ? 175 : 188}
          ry={ring === "inner" ? 88 : 94}
          className="secondary-orbit__line"
        />
      </svg>
      <div className="secondary-orbit__planets">
        {projects.map((p, i) => {
          const { x, y } = offsets[i] ?? { x: 0, y: 0 };
          const accent = catColors[p.category] || "#2DD4BF";
          return (
            <div
              key={p.slug}
              className="secondary-orbit__arm"
              style={{ transform: `translate(${x}rem, ${y}rem)` }}
            >
              <Link
                href={`/projects/${p.slug}`}
                className="secondary-orbit__planet"
                style={{ "--planet-accent": accent } as React.CSSProperties}
                title={p.displayName}
              >
                <span className="secondary-orbit__dot" aria-hidden />
                <span className="secondary-orbit__label">
                  {p.displayName}
                  {p.private && (
                    <LockIcon
                      className="inline w-2.5 h-2.5 ml-0.5 opacity-50"
                      aria-label="Private"
                    />
                  )}
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SecondaryOrbitRings({
  projects,
}: SecondaryOrbitRingsProps) {
  const split = Math.ceil(projects.length / 2);
  const inner = projects.slice(0, split);
  const outer = projects.slice(split);

  return (
    <section
      className="secondary-orbit"
      aria-labelledby="secondary-orbit-heading"
    >
      <div className="cosmic-page secondary-orbit__intro">
        <h2 id="secondary-orbit-heading" className="secondary-orbit__heading">
          Full catalog orbit
        </h2>
        <p className="secondary-orbit__hint">
          {projects.length} more systems — smaller worlds, same dossiers. Tap any
          planet or browse the{" "}
          <Link href="/projects" className="detail-nav-link">
            full grid
          </Link>
          .
        </p>
      </div>

      <div className="secondary-orbit__stage">
        <SecondaryRing
          projects={inner}
          ring="inner"
          offsetRem={{ x: 2.5, y: 0.5 }}
        />
        <SecondaryRing
          projects={outer}
          ring="outer"
          offsetRem={{ x: -2, y: 1.25 }}
        />
      </div>
    </section>
  );
}
