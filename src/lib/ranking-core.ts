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

export const DEFAULT_PIN_COUNT = 5;

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
 * takes a lead slot after the listed pins (pin order is display order); `onSubstitute` receives each skipped pin.
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
  for (const slug of [...new Set(pins)].slice(0, pinCount)) {
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

export interface CapabilityGroup<T> {
  capability: string;
  projects: T[];
}

/**
 * The fixed order of capability groups on every surface. This file stays
 * import-free (the PDF script loads it directly), so the order is repeated
 * here; a test keeps it equal to `CAPABILITY_IDS` in `capability-meta.ts`.
 */
export const CAPABILITY_ORDER = [
  "evals-routing",
  "retrieval-memory",
  "agents-computer-use",
  "products",
  "tooling-infra",
] as const;

/**
 * Projects that sit last inside their capability group and never lead one.
 * The flat ranking (and the frozen video queue derived from it) is untouched;
 * this only reorders the grouped views.
 */
export const LAST_IN_GROUP: readonly string[] = ["portfolio-hub"];

/**
 * Capability views over the ranked list (KD2). The lead block is excluded and
 * projects stay in rank order inside each group, except `LAST_IN_GROUP`
 * slugs, which follow the rest of their group. Groups come in the fixed
 * `CAPABILITY_ORDER` (unknown capabilities after, in first-seen order).
 * Entries without a capability are skipped (a test guarantees every listed
 * project has one).
 */
export function capabilityGroups<T extends { capability?: string; slug?: string }>(
  ranked: readonly T[],
  leadCount: number = DEFAULT_PIN_COUNT
): CapabilityGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const p of restProjects(ranked, leadCount)) {
    if (!p.capability) continue;
    const list = groups.get(p.capability);
    if (list) list.push(p);
    else groups.set(p.capability, [p]);
  }
  const rank = (capability: string) => {
    const i = (CAPABILITY_ORDER as readonly string[]).indexOf(capability);
    return i === -1 ? CAPABILITY_ORDER.length : i;
  };
  const isLast = (p: T) => !!p.slug && LAST_IN_GROUP.includes(p.slug);
  return [...groups]
    .map(([capability, projects], seen) => ({
      capability,
      seen,
      projects: [...projects.filter((p) => !isLast(p)), ...projects.filter(isLast)],
    }))
    .sort((a, b) => rank(a.capability) - rank(b.capability) || a.seen - b.seen)
    .map(({ capability, projects }) => ({ capability, projects }));
}
