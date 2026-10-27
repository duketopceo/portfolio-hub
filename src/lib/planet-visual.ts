import type { CSSProperties } from "react";
import { isProjectLive } from "@/lib/deployments";
import { HOMEPAGE_FEATURED_SLUGS } from "@/lib/project-completeness";
import {
  resolvePlanetLook,
  resolveRing,
  type ResolvedPlanetLook,
  type ResolvedRing,
} from "@/lib/planet-spec";
import type {
  EnrichedProject,
  PlanetMoonConfig,
  PlanetRingConfig,
  PlanetShape,
  PlanetSize,
} from "@/lib/types";
import { catColors } from "@/lib/utils";

export type {
  PlanetSurface,
  PlanetPalette,
  ResolvedRing,
} from "@/lib/planet-spec";

export type OrbitVisualTier = "primary" | "secondary";

/** A fully-defaulted PlanetSpec: everything the scene and the plate draw. */
export interface ResolvedPlanetVisual extends ResolvedPlanetLook {
  size: PlanetSize;
  shape: PlanetShape;
  /** Base colour (category colour unless the spec overrides it). */
  color: string;
  rings: ResolvedRing[];
  moons: PlanetMoonConfig[];
}

const SIZE_SCALE: Record<PlanetSize, number> = {
  xs: 0.62,
  sm: 0.78,
  md: 1,
  lg: 1.28,
  xl: 1.55,
};

export function planetSizeScale(size: PlanetSize): number {
  return SIZE_SCALE[size];
}

function defaultShape(project: EnrichedProject): PlanetShape {
  if (project.planetVisual?.shape) return project.planetVisual.shape;
  switch (project.type) {
    case "infra":
      return "hex";
    case "experiment":
      return "diamond";
    case "platform":
      return "sphere";
    case "app":
      return "cube";
    default:
      return "sphere";
  }
}

function defaultSize(
  project: EnrichedProject,
  tier: OrbitVisualTier
): PlanetSize {
  if (project.planetVisual?.size) return project.planetVisual.size;

  if (tier === "primary") return "lg";

  if (isProjectLive(project)) return "md";
  if (project.type === "platform" || project.type === "app") return "sm";
  return "xs";
}

function resolveRings(
  project: EnrichedProject,
  tier: OrbitVisualTier,
  color: string
): ResolvedRing[] {
  const authored = project.planetVisual?.rings;
  // An authored list (even an empty one) is final; defaults only fill in
  // when the spec says nothing about rings.
  let configs: PlanetRingConfig[] = authored ?? [];
  if (authored === undefined) {
    if (tier === "primary" && project.type === "platform") {
      configs = [
        { opacity: 0.35, tilt: -18 },
        { opacity: 0.2, tilt: 24 },
      ];
    } else if (tier === "secondary" && isProjectLive(project)) {
      configs = [{ opacity: 0.22, tilt: -12 }];
    } else {
      return [];
    }
  }
  const out: ResolvedRing[] = [];
  for (const cfg of configs) {
    out.push(resolveRing(cfg, color, out[out.length - 1]?.outer));
  }
  return out;
}

function liveMoon(project: EnrichedProject): PlanetMoonConfig | null {
  const url = project.liveUrl ?? project.demoUrl;
  if (!url || project.demoOffline) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const label = host.split(".")[0] ?? "live";
    return { label, kind: "live", href: url };
  } catch {
    return { label: "live", kind: "live", href: url };
  }
}

function defaultMoons(
  project: EnrichedProject,
  tier: OrbitVisualTier
): PlanetMoonConfig[] {
  if (project.planetVisual?.moons?.length) return project.planetVisual.moons;

  const moons: PlanetMoonConfig[] = [];
  const live = liveMoon(project);
  if (live) moons.push(live);

  if (tier === "secondary") {
    return moons.slice(0, 1);
  }

  if (moons.length === 0 && project.techStack.length > 0) {
    moons.push({
      label: project.techStack[0],
      kind: "stack",
    });
  }

  return moons.slice(0, 3);
}

export function resolvePlanetVisual(
  project: EnrichedProject,
  tier: OrbitVisualTier
): ResolvedPlanetVisual {
  const spec = project.planetVisual;
  const color = spec?.color ?? catColors[project.category] ?? "#2DD4BF";

  return {
    ...resolvePlanetLook({
      slug: project.slug,
      type: project.type,
      baseColor: color,
      authored: spec,
    }),
    size: defaultSize(project, tier),
    shape: defaultShape(project),
    color,
    rings: resolveRings(project, tier, color),
    moons: defaultMoons(project, tier),
  };
}

/**
 * Focal planets get extra meridians on the static plate and the line-art
 * (software GL) path. At most two, both from HOMEPAGE_FEATURED_SLUGS.
 */
export const FOCAL_SLUGS = ["kurultai", "pace-server"] as const satisfies readonly (typeof HOMEPAGE_FEATURED_SLUGS)[number][];

export function isFocalSlug(slug: string): boolean {
  return (FOCAL_SLUGS as readonly string[]).includes(slug);
}

/** Body radius in scene units (~rem) for the canvas survey plates. */
export function planetBodyRadius(size: PlanetSize): number {
  return BODY_RADIUS_REM * SIZE_SCALE[size];
}

/** Base body radius (rem). The DOM plate's `--planet-base` is 2x this, so the
 *  static plate and the live scene draw the same disc. */
export const BODY_RADIUS_REM = 1.75;

const LIMB_SIDES: Record<PlanetShape, { sides: number; offset: number }> = {
  sphere: { sides: 64, offset: 0 },
  hex: { sides: 6, offset: 0 },
  diamond: { sides: 4, offset: Math.PI / 2 },
  cube: { sides: 4, offset: Math.PI / 4 },
};

/** Closed limb outline in the XY plane (first point repeated at the end). */
export function limbPoints(
  shape: PlanetShape,
  radius: number
): [number, number, number][] {
  const { sides, offset } = LIMB_SIDES[shape];
  const pts: [number, number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const a = offset + (i / sides) * Math.PI * 2;
    pts.push([radius * Math.cos(a), radius * Math.sin(a), 0]);
  }
  pts.push([...pts[0]] as [number, number, number]);
  return pts;
}

/** Line-art meridians: none when real 3D bodies are drawn; two on the
 *  software-GL path, four for a focal body. */
export function meridianCount(focal: boolean, bodiesActive: boolean): number {
  if (bodiesActive) return 0;
  return focal ? 4 : 2;
}

export function isFeaturedSlug(slug: string): boolean {
  return (HOMEPAGE_FEATURED_SLUGS as readonly string[]).includes(slug);
}

export function shortPlanetLabel(name: string, max = 14): string {
  if (name.length <= max) return name;
  const words = name.split(/\s+/);
  if (words.length > 1 && words[0].length <= max - 2) {
    return `${words[0]}…`;
  }
  return `${name.slice(0, max - 1)}…`;
}

/** CSS custom properties for PlanetNode */
export function planetVisualStyle(
  visual: ResolvedPlanetVisual,
  index = 0
): CSSProperties {
  return {
    "--planet-color": visual.color,
    "--planet-low": visual.palette[0],
    "--planet-mid": visual.palette[1],
    "--planet-high": visual.palette[2],
    "--planet-scale": planetSizeScale(visual.size),
    "--planet-index": index,
  } as CSSProperties;
}

export function shapeClass(shape: PlanetShape): string {
  return `planet-node__core--${shape}`;
}
