import type { EnrichedProject } from "@/lib/types";

/** Homepage solar orbit — top 5 featured systems (fixed order). Read by the scene and catalog tests; pages use the ranking. */
export const HOMEPAGE_FEATURED_SLUGS = [
  "pace-server",
  "argus",
  "tallyline",
  "kurultai",
  "orchestral",
] as const;

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
