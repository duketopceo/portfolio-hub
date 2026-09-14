"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { EnrichedProject } from "@/lib/types";
import { useMediaQuery } from "@/lib/use-media-query";
import { PlanetNode } from "@/components/planet/PlanetNode";

const SceneFrame = dynamic(() => import("@/components/scene/SceneFrame"), {
  ssr: false,
});
const BeltScene = dynamic(() => import("@/components/scene/BeltScene"), {
  ssr: false,
});

interface SecondaryOrbitRingsProps {
  projects: EnrichedProject[];
  /** Registry numbers aligned to `projects` — source-order catalog position. */
  registryIndexOf?: number[];
}

type RingId = "inner" | "outer";

interface RingLayout {
  rx: number;
  ry: number;
  phase: number;
  offset: { x: number; y: number };
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
  mobile,
  registryIndexOf,
}: {
  projects: EnrichedProject[];
  ring: RingId;
  mobile: boolean;
  registryIndexOf?: number[];
}) {
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
        transform: `translate(${layout.offset.x.toFixed(4)}rem, ${layout.offset.y.toFixed(4)}rem)`,
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
              style={{ transform: `translate(${x.toFixed(4)}rem, ${y.toFixed(4)}rem)` }}
            >
              <PlanetNode
                project={p}
                tier="secondary"
                href={`/projects/${p.slug}`}
                labelAbove={labelAbove}
                index={registryIndexOf?.[i] ?? i}
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
  registryIndexOf,
}: SecondaryOrbitRingsProps) {
  const mobile = useMediaQuery("(max-width: 640px)");
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
          <span className="reg-label reg-label--accent">Fig. 02</span> — Catalog belt
        </h2>
        <p className="secondary-orbit__hint">
          {projects.length} additional bodies on offset survey rings. Select a
          marker for its survey file, or open the{" "}
          <Link href="/projects" className="detail-nav-link">
            full registry
          </Link>
          .
        </p>
      </div>

      <div className="secondary-orbit__stage">
        <SceneFrame
          className="belt-scene"
          camera={{ position: [0, 11, 34], fov: 42 }}
        >
          <BeltScene />
        </SceneFrame>
        <SecondaryRing
          projects={inner}
          ring="inner"
          mobile={mobile}
          registryIndexOf={registryIndexOf?.slice(0, mid)}
        />
        <SecondaryRing
          projects={outer}
          ring="outer"
          mobile={mobile}
          registryIndexOf={registryIndexOf?.slice(mid)}
        />
      </div>
    </section>
  );
}
