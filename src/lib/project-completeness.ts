import type { EnrichedProject, OrbitTier } from "@/lib/types";
import { isProjectLive } from "@/lib/deployments";
import { isListedProject } from "@/lib/catalog-filter";
import { completenessScore } from "@/lib/ranking-score";

/** Homepage solar orbit — top 5 featured systems (fixed order). */
export const HOMEPAGE_FEATURED_SLUGS = [
  "pace-server",
  "argus",
  "tallyline",
  "kurultai",
  "orchestral",
] as const;

/**
 * Completeness score for one enriched project. Weights live in
 * `ranking-score.ts`; page order comes from `ranking.ts`, not from here.
 */
export function scoreProjectCompleteness(
  p: EnrichedProject,
  now: number = Date.now()
): number {
  return completenessScore({
    private: p.private,
    hasRepo: !!p.repo,
    liveUrl: !!p.liveUrl,
    demoUrl: !!p.demoUrl,
    embeddable: !!p.embeddable,
    isLive: isProjectLive(p),
    stars: p.stars,
    highlights: p.highlights?.length ?? 0,
    techStack: p.techStack?.length ?? 0,
    hasArchitecture: !!p.architecture && p.architecture.trim().length > 0,
    descriptionLength: (p.description ?? "").trim().length,
    isPlatformOrApp: p.type === "platform" || p.type === "app",
    lastActivity: p.lastUpdated || null,
    now,
  });
}

export function sortProjectsByCompleteness(
  projects: EnrichedProject[]
): EnrichedProject[] {
  return [...projects].sort((a, b) => {
    const db = scoreProjectCompleteness(b);
    const da = scoreProjectCompleteness(a);
    if (db !== da) return db - da;
    return a.displayName.localeCompare(b.displayName);
  });
}

/**
 * Projects shown in the homepage primary solar orbit (fixed order).
 */
export function getHomepageOrbitProjects(
  projects: EnrichedProject[]
): EnrichedProject[] {
  return HOMEPAGE_FEATURED_SLUGS.map((slug) =>
    projects.find((p) => p.slug === slug && isListedProject(p))
  ).filter((p): p is EnrichedProject => p !== undefined);
}

/** Remaining catalog entries for secondary homepage orbit(s). */
export function getHomepageSecondaryOrbitProjects(
  projects: EnrichedProject[]
): EnrichedProject[] {
  const featured = new Set<string>(HOMEPAGE_FEATURED_SLUGS);
  return sortProjectsByCompleteness(
    projects.filter(
      (p) =>
        !featured.has(p.slug) &&
        isListedProject(p) &&
        p.orbitTier !== "catalog-only"
    )
  );
}

/** Resolve orbit tier from config (explicit field or featured flag). */
export function resolveOrbitTier(project: {
  slug: string;
  featured: boolean;
  orbitTier?: OrbitTier;
}): OrbitTier {
  if (project.orbitTier) return project.orbitTier;
  if ((HOMEPAGE_FEATURED_SLUGS as readonly string[]).includes(project.slug)) {
    return "featured";
  }
  return "secondary";
}

/**
 * Adjacent projects in an ordered list (wraparound).
 */
export function getOrbitAdjacent(
  ordered: EnrichedProject[],
  slug: string
): { project: EnrichedProject; prev: EnrichedProject; next: EnrichedProject; index: number } | null {
  const index = ordered.findIndex((p) => p.slug === slug);
  if (index === -1 || ordered.length === 0) return null;
  const n = ordered.length;
  return {
    project: ordered[index],
    prev: ordered[(index - 1 + n) % n],
    next: ordered[(index + 1) % n],
    index,
  };
}
