import { listedProjects } from "@/lib/catalog";
import { rankProjects } from "@/lib/ranking";

/** The signal and the hire page feature ranking positions 1 to 5 (KTD1). */
export const FEATURED_COUNT = 5;

/** Slugs at ranking positions 1 to `FEATURED_COUNT`, in rank order. */
export function featuredSlugs(): string[] {
  return rankProjects(listedProjects())
    .slice(0, FEATURED_COUNT)
    .map((p) => p.slug);
}
