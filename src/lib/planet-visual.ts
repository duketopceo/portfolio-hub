import type { CSSProperties } from "react";
import { isProjectLive } from "@/lib/deployments";
import { HOMEPAGE_FEATURED_SLUGS } from "@/lib/project-completeness";
import type {
  EnrichedProject,
  PlanetMoonConfig,
  PlanetRingConfig,
  PlanetShape,
  PlanetSize,
} from "@/lib/types";
import { catColors } from "@/lib/utils";

export type OrbitVisualTier = "primary" | "secondary";

export interface ResolvedPlanetVisual {
  size: PlanetSize;
  shape: PlanetShape;
  color: string;
  rings: PlanetRingConfig[];
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

  if (tier === "primary") {
    if (project.slug === "kurultai" || project.slug === "khan") return "xl";
    return "lg";
  }

  if (isProjectLive(project)) return "md";
  if (project.type === "platform" || project.type === "app") return "sm";
  return "xs";
}

function defaultRings(
  project: EnrichedProject,
  tier: OrbitVisualTier,
  color: string
): PlanetRingConfig[] {
  if (project.planetVisual?.rings?.length) return project.planetVisual.rings;

  if (tier === "primary" && project.type === "platform") {
    return [
      { color, opacity: 0.35, tilt: -18 },
      { color, opacity: 0.2, tilt: 24 },
    ];
  }

  if (tier === "secondary" && isProjectLive(project)) {
    return [{ color, opacity: 0.22, tilt: -12 }];
  }

  return [];
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
  const color =
    project.planetVisual?.color ??
    catColors[project.category] ??
    "#2DD4BF";

  return {
    size: defaultSize(project, tier),
    shape: defaultShape(project),
    color,
    rings: defaultRings(project, tier, color),
    moons: defaultMoons(project, tier),
  };
}

/**
 * Focal planets get the contour-shader fill (when the renderer is a real GPU)
 * or extra meridians. At most two, both from HOMEPAGE_FEATURED_SLUGS.
 */
export const FOCAL_SLUGS = ["pace-server", "kurultai"] as const satisfies readonly (typeof HOMEPAGE_FEATURED_SLUGS)[number][];

export function isFocalSlug(slug: string): boolean {
  return (FOCAL_SLUGS as readonly string[]).includes(slug);
}

/** Body radius in scene units (~rem) for the canvas survey plates. */
export function planetBodyRadius(size: PlanetSize): number {
  return 0.42 * SIZE_SCALE[size];
}

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

/** Default body has two meridians; a focal body without the shader gets four. */
export function meridianCount(focal: boolean, shaderActive: boolean): number {
  return focal && !shaderActive ? 4 : 2;
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
    "--planet-scale": planetSizeScale(visual.size),
    "--planet-index": index,
  } as CSSProperties;
}

export function shapeClass(shape: PlanetShape): string {
  return `planet-node__core--${shape}`;
}
