import { PIN_COUNT, RANKING_PINS } from "@/data/ranking-pins";
import snapshotJson from "@/data/ranking-snapshot.json";
import {
  buildRanking as buildRankingCore,
  type Rankable,
  type RankingSnapshot,
} from "@/lib/ranking-core";

export { orderByRank } from "@/lib/ranking-core";
export type { Rankable, RankingSnapshot, RankingSnapshotEntry } from "@/lib/ranking-core";

/**
 * One ranking for every page (KTD1): a flat ordered list of listed projects,
 * the pinned leads first, then everything else by the snapshot's extended
 * score, ties by name. Category groups are views over that list.
 */

export const rankingSnapshot: RankingSnapshot = snapshotJson;

/** Ranking with explicit pins and snapshot (tests); defaults are the committed ones. */
export function buildRanking<T extends Rankable>(
  projects: readonly T[],
  options: {
    snapshot?: RankingSnapshot;
    pins?: readonly string[];
    pinCount?: number;
    onSubstitute?: (skippedPin: string, filledBy: string) => void;
  } = {}
): T[] {
  return buildRankingCore(projects, {
    snapshot: options.snapshot ?? rankingSnapshot,
    pins: options.pins ?? RANKING_PINS,
    pinCount: options.pinCount ?? PIN_COUNT,
    onSubstitute: options.onSubstitute,
  });
}

/** Ranking from the committed pins and snapshot; logs a pin substitution once per build. */
export function rankProjects<T extends Rankable>(projects: readonly T[]): T[] {
  return buildRanking(projects, {
    onSubstitute: (pin, fill) =>
      console.warn(`ranking: pinned slug "${pin}" is not listed; "${fill}" fills its slot`),
  });
}

/** The lead block: the first `PIN_COUNT` entries of a ranked list. */
export function leadProjects<T>(ranked: readonly T[], count: number = PIN_COUNT): T[] {
  return ranked.slice(0, count);
}

/** Ranked entries after the lead block. */
export function restProjects<T>(ranked: readonly T[], count: number = PIN_COUNT): T[] {
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
  leadCount: number = PIN_COUNT
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
