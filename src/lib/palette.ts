/**
 * The site palette (owner decision, 2026-11-15): true black ground, white for
 * primary text, a slightly warm off-white for secondary surfaces, lines and
 * some text, greys for muted, and at most TWO accents used sparingly where
 * meaning needs them. No purple, violet, blue, teal or green anywhere. CSS
 * tokens in src/app/design-system/tokens.css are canonical; this mirror exists
 * for the canvas/SVG layers that cannot read CSS variables. palette.test.ts
 * fails if the two drift.
 */
export const COSMOS_PALETTE = {
  /** Interactive: pure white. */
  accent: "#FFFFFF",
  /** Very subtle warm off-white: secondary text, lines and surfaces. */
  tint: "#F2EFEA",
  /** Accent 1, amber: highlight, live and active state. */
  heat: "#FF9F1C",
  /** Accent 2, ember: alert, classification and failure. */
  ember: "#FF5C1A",
  /** Neutrals. */
  night: "#000000",
  starlight: "#FFFFFF",
  slate: "#B3B3B3",
} as const;

/** The only two chromatic colours the site may use. */
export const ACCENTS = [COSMOS_PALETTE.heat, COSMOS_PALETTE.ember] as const;

/** CSS custom property that carries each palette role. */
export const PALETTE_TOKENS = {
  accent: "--color-accent",
  tint: "--color-tint",
  heat: "--color-heat",
  ember: "--color-signal",
} as const;

export type PaletteRole = keyof typeof PALETTE_TOKENS;
