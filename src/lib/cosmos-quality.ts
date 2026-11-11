/**
 * Quality ladder for the live background. The scene starts at "full"; when
 * the frame rate stays under budget it steps down one rung at a time and,
 * from "low", hands the stage to the static plate. It never steps back up:
 * a visitor whose machine failed repeatedly keeps the calm plate rather than
 * flapping between renditions. The lensed arcs and flow detail go first
 * ("full" -> "high": the arcs collapse to a plain ring glow); "low" then
 * drops the ring glow and the flow octave, and renders fewer pixels.
 */
export type CosmosTier = "full" | "high" | "low" | "plate";

/** Sustained frame rates below this count as a missed budget (success target: 55+). */
export const DECLINE_BELOW_FPS = 45;

export interface TierSettings {
  /** Device-pixel-ratio range handed to the canvas. */
  dpr: [number, number];
  /** The far side of the disk lensed into arcs over and under the hole. */
  lensing: boolean;
  /** Soft bloom around the shadow edge (ported Rune glow). */
  glow: boolean;
  /** Extra noise octave in the disk shader: 1 = on, 0 = off. */
  detail: 0 | 1;
}

const SETTINGS: Record<Exclude<CosmosTier, "plate">, TierSettings> = {
  // DPR capped at 1 even on full: the disk is soft light, not fine detail.
  full: { dpr: [1, 1], lensing: true, glow: true, detail: 1 },
  high: { dpr: [1, 1], lensing: false, glow: true, detail: 1 },
  low: { dpr: [0.75, 0.75], lensing: false, glow: false, detail: 0 },
};

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
