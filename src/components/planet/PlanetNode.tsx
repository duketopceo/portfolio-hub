"use client";

import Link from "next/link";
import type { EnrichedProject } from "@/lib/types";
import {
  planetVisualStyle,
  resolvePlanetVisual,
  shapeClass,
  shortPlanetLabel,
  type OrbitVisualTier,
} from "@/lib/planet-visual";
import { LockIcon } from "@/components/Icons";

interface PlanetNodeProps {
  project: EnrichedProject;
  tier: OrbitVisualTier;
  href: string;
  focused?: boolean;
  labelAbove?: boolean;
  index?: number;
  compactLabel?: boolean;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  tabIndex?: number;
  className?: string;
}

function MoonChip({
  moon,
  orbitIndex,
  moonIndex,
}: {
  moon: { label: string; kind: string; href?: string };
  orbitIndex: number;
  moonIndex: number;
}) {
  const angle = (360 / Math.max(orbitIndex + 2, 3)) * moonIndex;
  const style = {
    "--moon-angle": `${angle}deg`,
    "--moon-orbit": orbitIndex + 1,
  } as React.CSSProperties;

  const body = (
    <span
      className={`planet-node__moon planet-node__moon--${moon.kind}`}
      style={style}
      title={moon.label}
    >
      <span className="planet-node__moon-dot" aria-hidden />
      <span className="planet-node__moon-label">{moon.label}</span>
    </span>
  );

  if (moon.href && moon.kind !== "stack") {
    return (
      <a
        href={moon.href}
        className="planet-node__moon-link"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        aria-label={`${moon.label} (${moon.kind})`}
      >
        {body}
      </a>
    );
  }

  return body;
}

export function PlanetNode({
  project,
  tier,
  href,
  focused = false,
  labelAbove,
  index = 0,
  compactLabel = false,
  onMouseEnter,
  onFocus,
  tabIndex,
  className = "",
}: PlanetNodeProps) {
  const visual = resolvePlanetVisual(project, tier);
  const label = compactLabel
    ? shortPlanetLabel(project.displayName, tier === "secondary" ? 11 : 18)
    : project.displayName;

  const labelPlacement =
    labelAbove === undefined
      ? ""
      : labelAbove
        ? " planet-node--label-above"
        : " planet-node--label-below";

  return (
    <Link
      href={href}
      className={`planet-node planet-node--${tier} planet-node--${visual.size}${labelPlacement}${
        focused ? " planet-node--focused" : ""
      } ${className}`.trim()}
      style={planetVisualStyle(visual, index)}
      title={project.displayName}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      tabIndex={tabIndex}
    >
      <span className="planet-node__body">
        {visual.rings.map((ring, i) => (
          <span
            key={`ring-${i}`}
            className="planet-node__ring"
            style={
              {
                "--ring-color": ring.color ?? visual.color,
                "--ring-opacity": ring.opacity ?? 0.3,
                "--ring-tilt": `${ring.tilt ?? 0}deg`,
              } as React.CSSProperties
            }
            aria-hidden
          />
        ))}
        <span
          className={`planet-node__core ${shapeClass(visual.shape)}`}
          aria-hidden
        />
        {visual.moons.length > 0 && (
          <span className="planet-node__moons" aria-hidden>
            {visual.moons.map((moon, mi) => (
              <MoonChip
                key={`${moon.label}-${mi}`}
                moon={moon}
                orbitIndex={mi}
                moonIndex={mi}
              />
            ))}
          </span>
        )}
      </span>
      <span className="planet-node__label">
        <span className="planet-node__id" aria-hidden="true">
          CI-{String(index + 1).padStart(2, "0")}
        </span>
        <span className="planet-node__name">
          {label}
          {project.private && (
            <LockIcon
              className="inline w-2.5 h-2.5 ml-0.5 opacity-60"
              aria-label="Private"
            />
          )}
        </span>
      </span>
    </Link>
  );
}
