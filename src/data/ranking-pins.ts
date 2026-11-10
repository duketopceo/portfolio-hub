/**
 * The three lead projects, in display order (KD1). Luke pins these; the
 * score ranks everything else. Default: the top three of the extended score
 * in `ranking-snapshot.json` (2026-11-10), pending Luke's confirmation.
 */
export const RANKING_PINS = ["kurultai", "tallyline", "portfolio-hub"] as const;

/** Number of lead slots. A pin that is not listed is replaced by the next-ranked project. */
export const PIN_COUNT = 3;
