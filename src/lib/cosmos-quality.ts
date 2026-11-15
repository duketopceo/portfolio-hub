/**
 * Quality ladder for the live background. The scene starts at "full"; when
 * the frame rate stays under budget it steps down one rung at a time and,
 * from "low", hands the stage to the static plate. It never steps back up:
 * a visitor whose machine failed repeatedly keeps the calm plate rather than
 * flapping between renditions. Each step thins the starfield (3200 -> 2200 ->
 * 1000 stars at 1440 x 900) and "low" also renders fewer pixels.
 */
export type CosmosTier = "full" | "high" | "low" | "plate";

/** Sustained frame rates below this count as a missed budget (success target: 55+). */
export const DECLINE_BELOW_FPS = 45;

export interface TierSettings {
  /** Device-pixel-ratio range handed to the canvas. */
  dpr: [number, number];
  /** Stars drawn on a 1440 x 900 viewport; scaled by `starCount` for other sizes. */
  stars: number;
}

const SETTINGS: Record<Exclude<CosmosTier, "plate">, TierSettings> = {
  // DPR capped at 1 even on full: stars are 1 to 2.5 px points.
  full: { dpr: [1, 1], stars: 3200 },
  high: { dpr: [1, 1], stars: 2200 },
  low: { dpr: [0.75, 0.75], stars: 1000 },
};

/** Viewport area (px squared) the `stars` figures are quoted for. */
export const STAR_REFERENCE_AREA = 1440 * 900;

/**
 * Stars to draw for a tier on a viewport: the tier's figure scaled by area,
 * in steps of a tenth so a window resize does not rebuild the geometry on
 * every pixel, and clamped so a phone still has a sky and a 4K display does
 * not pay for one.
 */
export function starCount(tier: CosmosTier, width: number, height: number): number {
  const base = tierSettings(tier).stars;
  const ratio = (Math.max(width, 0) * Math.max(height, 0)) / STAR_REFERENCE_AREA;
  const stepped = Math.round(Math.min(Math.max(ratio, 0.4), 1.2) * 10) / 10;
  return Math.round(base * stepped);
}

/** Settings for a rung; the plate renders no scene so it reuses "low". */
export function tierSettings(tier: CosmosTier): TierSettings {
  return SETTINGS[tier === "plate" ? "low" : tier];
}

const NEXT: Record<CosmosTier, CosmosTier> = {
  full: "high",
  high: "low",
  low: "plate",
  plate: "plate",
};

export function stepDown(tier: CosmosTier): CosmosTier {
  return NEXT[tier];
}
