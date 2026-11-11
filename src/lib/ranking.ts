import { RANKING_PINS } from "@/data/ranking-pins";
import snapshotJson from "@/data/ranking-snapshot.json";
import {
  buildRanking as buildRankingCore,
  type Rankable,
  type RankingSnapshot,
} from "@/lib/ranking-core";

export {
  capabilityGroups,
  leadProjects,
  orderByRank,
  restProjects,
} from "@/lib/ranking-core";
export type { CapabilityGroup } from "@/lib/ranking-core";
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
    pinCount: options.pinCount,
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
