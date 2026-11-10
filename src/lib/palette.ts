/**
 * The site palette: white on black plus warm accents. CSS tokens in
 * src/app/design-system/tokens.css are canonical; this mirror exists for the
 * canvas/SVG layers that cannot read CSS variables. palette.test.ts fails if
 * the two drift.
 */
export const COSMOS_PALETTE = {
  /** Accent: pure white. Interactive + live. */
  accent: "#FFFFFF",
  /** Ember: classification, alert, accretion-disk heat. */
  ember: "#FF5C1A",
  /** Amber: signal heat bars and sparing warm highlights. */
  heat: "#FF9F1C",
  /** Pop: soft gold. Falling starlight and rare highlights only. */
  pop: "#F5D76E",
  /** Neutrals. */
  night: "#000000",
  starlight: "#FFFFFF",
  slate: "#B3B3B3",
  /**
   * Deprecated alias of `accent`, kept only so the background scene files
   * (owned by the black-hole background work) still compile. No teal remains.
   */
  teal: "#FFFFFF",
} as const;

/** CSS custom property that carries each chromatic role. */
export const PALETTE_TOKENS = {
  accent: "--color-accent",
  ember: "--color-signal",
  heat: "--color-heat",
  pop: "--color-pop",
} as const;

export type PaletteRole = keyof typeof PALETTE_TOKENS;
