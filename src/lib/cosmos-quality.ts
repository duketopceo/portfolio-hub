/**
 * Quality ladder for the live background. The scene starts at "high"; when
 * the frame rate stays under budget it steps down one rung at a time and,
 * from "low", hands the stage to the static plate. It never steps back up:
 * a visitor whose machine failed twice keeps the calm plate rather than
 * flapping between renditions.
 */
export type CosmosTier = "high" | "low" | "plate";

/** Sustained frame rates below this count as a missed budget (success target: 55+). */
export const DECLINE_BELOW_FPS = 45;

export interface TierSettings {
  /** Device-pixel-ratio range handed to the canvas. */
  dpr: [number, number];
  /** Constellation link lines between stars. */
  links: boolean;
  /** Extra noise octave in the disk shader: 1 = on, 0 = off. */
  detail: 0 | 1;
}

const SETTINGS: Record<Exclude<CosmosTier, "plate">, TierSettings> = {
  // DPR capped at 1 even on high: the disk is soft light, not fine detail.
  high: { dpr: [1, 1], links: true, detail: 1 },
  low: { dpr: [0.75, 0.75], links: false, detail: 0 },
};

/** Settings for a rung; the plate renders no scene so it reuses "low". */
export function tierSettings(tier: CosmosTier): TierSettings {
  return SETTINGS[tier === "plate" ? "low" : tier];
}

export function stepDown(tier: CosmosTier): CosmosTier {
  return tier === "high" ? "low" : "plate";
}
