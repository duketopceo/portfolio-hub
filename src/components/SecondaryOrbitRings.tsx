"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EnrichedProject } from "@/lib/types";
import { PlanetNode } from "@/components/planet/PlanetNode";

interface SecondaryOrbitRingsProps {
  projects: EnrichedProject[];
}

type RingId = "inner" | "outer";

interface RingLayout {
  rx: number;
  ry: number;
  phase: number;
  offset: { x: number; y: number };
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return mobile;
}

function ringLayout(
  count: number,
  ring: RingId,
  mobile: boolean
): RingLayout {
  const n = Math.max(count, 1);
  const spread = mobile ? 0.55 : 1;
  const baseRx = mobile ? 11 : 30;
  const perPlanet = mobile ? 0.35 : 0.65;
  const rx = (baseRx + n * perPlanet) * spread;
  const ry = rx * 0.46;

  const phase =
    ring === "inner"
      ? -Math.PI / 2
      : -Math.PI / 2 + Math.PI / Math.max(n, 1);

  const offset =
    ring === "inner"
      ? { x: mobile ? 0.75 : 3, y: mobile ? 0.35 : 0.75 }
      : { x: mobile ? -0.5 : -2.5, y: mobile ? 1.1 : 2.25 };

  return { rx, ry, phase, offset };
}

function SecondaryRing({
  projects,
  ring,
  ringOffset,
}: {
  projects: EnrichedProject[];
  ring: RingId;
  ringOffset: number;
}) {
  const mobile = useIsMobile();
  const n = projects.length;
  const layout = ringLayout(n, ring, mobile);

  const offsets = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const theta = layout.phase + (2 * Math.PI * i) / Math.max(n, 1);
      return {
        x: layout.rx * Math.cos(theta),
        y: layout.ry * Math.sin(theta),
        labelAbove: Math.sin(theta) >= 0,
      };
    });
  }, [n, layout.phase, layout.rx, layout.ry]);

  if (n === 0) return null;

  const svgRx = layout.rx * (mobile ? 14 : 5.8);
  const svgRy = layout.ry * (mobile ? 14 : 5.8);

  return (
    <div
      className={`secondary-orbit__ring secondary-orbit__ring--${ring}`}
      style={{
        transform: `translate(${layout.offset.x}rem, ${layout.offset.y}rem)`,
      }}
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
          rx={svgRx}
          ry={svgRy}
          className="secondary-orbit__line"
        />
      </svg>

      <div className="secondary-orbit__planets">
        {projects.map((p, i) => {
          const { x, y, labelAbove } = offsets[i] ?? {
            x: 0,
            y: 0,
            labelAbove: true,
          };
          return (
            <div
              key={p.slug}
              className="secondary-orbit__arm"
              style={{ transform: `translate(${x}rem, ${y}rem)` }}
            >
              <PlanetNode
                project={p}
                tier="secondary"
                href={`/projects/${p.slug}`}
                labelAbove={labelAbove}
                index={ringOffset + i}
                compactLabel
              />
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
  const mid = Math.ceil(projects.length / 2);
  const inner = projects.slice(0, mid);
  const outer = projects.slice(mid);

  return (
    <section
      className="secondary-orbit"
      aria-labelledby="secondary-orbit-heading"
    >
      <div className="cosmic-page secondary-orbit__intro">
        <h2 id="secondary-orbit-heading" className="secondary-orbit__heading">
          Catalog orbit
        </h2>
        <p className="secondary-orbit__hint">
          {projects.length} more worlds — same modular planet system, scaled
          smaller and split across two offset rings. Tap for dossiers or browse
          the{" "}
          <Link href="/projects" className="detail-nav-link">
            full grid
          </Link>
          .
        </p>
      </div>

      <div className="secondary-orbit__stage">
        <SecondaryRing projects={inner} ring="inner" ringOffset={0} />
        <SecondaryRing projects={outer} ring="outer" ringOffset={inner.length} />
      </div>
    </section>
  );
}
