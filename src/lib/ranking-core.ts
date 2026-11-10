/**
 * Import-free ranking core (KTD1). The app and the PDF export script both
 * load this file, so the order is computed in one place. `ranking.ts` binds
 * it to the committed pins and snapshot.
 */

export interface RankingSnapshotEntry {
  slug: string;
  score: number;
}

export interface RankingSnapshot {
  asOf: string;
  entries: RankingSnapshotEntry[];
}

export const DEFAULT_PIN_COUNT = 3;

/** A listed entry is neither a component of another entry nor earlier work. */
function isListed(p: { parentSlug?: string; era?: "earlier" }): boolean {
  return !p.parentSlug && p.era !== "earlier";
}

export interface Rankable {
  slug: string;
  displayName: string;
  parentSlug?: string;
  era?: "earlier";
}

/** Slug to score lookup for a snapshot. */
function scoreMap(snapshot: RankingSnapshot): Map<string, number> {
  return new Map(snapshot.entries.map((e) => [e.slug, e.score]));
}

/**
 * Flat ranking of the listed projects in `projects`.
 * A pinned slug that is not listed is skipped and the next-ranked project
 * fills its slot; `onSubstitute` receives each skipped pin.
 */
export function buildRanking<T extends Rankable>(
  projects: readonly T[],
  options: {
    snapshot: RankingSnapshot;
    pins: readonly string[];
    pinCount?: number;
    onSubstitute?: (skippedPin: string, filledBy: string) => void;
  }
): T[] {
  const { snapshot, pins, pinCount = DEFAULT_PIN_COUNT, onSubstitute } = options;
  const scores = scoreMap(snapshot);
  const listed = projects.filter(isListed);
  const bySlug = new Map(listed.map((p) => [p.slug, p]));

  const byScore = [...listed].sort(
    (a, b) =>
      (scores.get(b.slug) ?? 0) - (scores.get(a.slug) ?? 0) ||
      a.displayName.localeCompare(b.displayName)
  );

  const leads: T[] = [];
  const skipped: string[] = [];
  for (const slug of pins.slice(0, pinCount)) {
    const p = bySlug.get(slug);
    if (p) leads.push(p);
    else skipped.push(slug);
  }
  const taken = new Set(leads.map((p) => p.slug));
  for (const slug of skipped) {
    const fill = byScore.find((p) => !taken.has(p.slug));
    if (!fill) break;
    leads.push(fill);
    taken.add(fill.slug);
    onSubstitute?.(slug, fill.slug);
  }

  return [...leads, ...byScore.filter((p) => !taken.has(p.slug))];
}

/**
 * Order items that cover one or more projects (a résumé entry can span a
 * project and its sibling). Each item sorts by the best rank among its slugs;
 * items covering no ranked project go last, in their authored order.
 */
export function orderByRank<T>(
  items: readonly T[],
  slugsOf: (item: T) => readonly string[],
  ranked: readonly { slug: string }[]
): T[] {
  const pos = new Map(ranked.map((p, i) => [p.slug, i] as const));
  const best = (item: T) =>
    Math.min(...slugsOf(item).map((s) => pos.get(s) ?? Number.POSITIVE_INFINITY));
  return items
    .map((item, authored) => ({ item, authored, best: best(item) }))
    .sort((a, b) => a.best - b.best || a.authored - b.authored)
    .map((x) => x.item);
}

/** The lead block: the first `DEFAULT_PIN_COUNT` entries of a ranked list. */
export function leadProjects<T>(ranked: readonly T[], count: number = DEFAULT_PIN_COUNT): T[] {
  return ranked.slice(0, count);
}

/** Ranked entries after the lead block. */
export function restProjects<T>(ranked: readonly T[], count: number = DEFAULT_PIN_COUNT): T[] {
  return ranked.slice(count);
}

export interface CategoryGroup<T> {
  category: string;
  projects: T[];
}

/**
 * Category views over the ranked list. The lead block is excluded, projects
 * stay in rank order inside each group, and groups are ordered by their
 * best-ranked member.
 */
export function categoryGroups<T extends { category: string }>(
  ranked: readonly T[],
  leadCount: number = DEFAULT_PIN_COUNT
): CategoryGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const p of restProjects(ranked, leadCount)) {
    const list = groups.get(p.category);
    if (list) list.push(p);
    else groups.set(p.category, [p]);
  }
  return [...groups].map(([category, projects]) => ({ category, projects }));
}

/** Zero-based rank of a slug in a ranked list, or -1. */
export function rankOf(ranked: readonly { slug: string }[], slug: string): number {
  return ranked.findIndex((p) => p.slug === slug);
}
