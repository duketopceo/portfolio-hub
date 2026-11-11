import {
  HOMEPAGE_FEATURED_SLUGS,
  getHomepageSecondaryOrbitProjects,
} from "@/lib/project-completeness";
import { isListedProject } from "@/lib/catalog-filter";
import type { EnrichedProject } from "@/lib/types";

export type LabOrbitRing = "inner" | "middle" | "outer";

export interface LabOrbitPlanet {
  project: EnrichedProject;
  ring: LabOrbitRing;
  /** Stable angle seed (radians) for even spacing on the ring. */
  baseAngle: number;
}

const FEATURED = new Set<string>(HOMEPAGE_FEATURED_SLUGS);

/** Plugins, libraries, and small tools — outer belt. */
export function isOuterBeltProject(project: Pick<EnrichedProject, "type" | "slug">): boolean {
  if (project.type === "library") return true;
  if (project.type === "experiment") return true;
  if (project.slug.includes("plugin")) return true;
  return false;
}

export function assignLabOrbitRing(project: EnrichedProject): LabOrbitRing | null {
  if (!isListedProject(project)) return null;
  if (FEATURED.has(project.slug)) return "inner";
  if (isOuterBeltProject(project)) return "outer";
  return "middle";
}

function distributeAngles<T>(items: T[]): { item: T; baseAngle: number }[] {
  const n = items.length;
  if (n === 0) return [];
  return items.map((item, i) => ({
    item,
    baseAngle: (i / n) * Math.PI * 2 - Math.PI / 2,
  }));
}

/**
 * Build three concentric rings from the curated catalog (no archived / earlier work).
 */
export function buildLabOrbitPlanets(projects: EnrichedProject[]): LabOrbitPlanet[] {
  const listed = projects.filter(isListedProject);

  const innerSlugs = [...HOMEPAGE_FEATURED_SLUGS];
  const inner = innerSlugs
    .map((slug) => listed.find((p) => p.slug === slug))
    .filter((p): p is EnrichedProject => p !== undefined);

  const secondary = getHomepageSecondaryOrbitProjects(listed);
  const middle = secondary.filter((p) => !isOuterBeltProject(p));
  const outer = secondary.filter((p) => isOuterBeltProject(p));

  const rings: LabOrbitPlanet[] = [
    ...distributeAngles(inner).map(({ item, baseAngle }) => ({
      project: item,
      ring: "inner" as const,
      baseAngle,
    })),
    ...distributeAngles(middle).map(({ item, baseAngle }) => ({
      project: item,
      ring: "middle" as const,
      baseAngle,
    })),
    ...distributeAngles(outer).map(({ item, baseAngle }) => ({
      project: item,
      ring: "outer" as const,
      baseAngle,
    })),
  ];

  return rings;
}

export const LAB_ORBIT_RING_SPEED: Record<LabOrbitRing, number> = {
  inner: 0.00011,
  middle: 0.00008,
  outer: 0.00005,
};

/** Ellipse radii in viewBox units (centered at 0,0). */
export const LAB_ORBIT_RX: Record<LabOrbitRing, number> = {
  inner: 88,
  middle: 132,
  outer: 172,
};

export const LAB_ORBIT_RY: Record<LabOrbitRing, number> = {
  inner: 52,
  middle: 78,
  outer: 102,
};
