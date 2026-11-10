/**
 * The site palette: two complements plus one pop. CSS tokens in
 * src/app/design-system/tokens.css are canonical; this mirror exists for the
 * canvas/SVG layers that cannot read CSS variables. palette.test.ts fails if
 * the two drift.
 */
export const COSMOS_PALETTE = {
  /** Complement A: interactive + live. */
  teal: "#2DD4BF",
  /** Complement B: classification, alert, accretion-disk heat. */
  ember: "#FF5C1A",
  /** Pop: falling starlight and rare highlights only. */
  pop: "#A78BFA",
  /** Neutrals. */
  night: "#07090B",
  starlight: "#E9ECEF",
  slate: "#9AA3AC",
} as const;

/** CSS custom property that carries each chromatic role. */
export const PALETTE_TOKENS = {
  teal: "--color-accent",
  ember: "--color-signal",
  pop: "--color-pop",
} as const;

export type PaletteRole = keyof typeof PALETTE_TOKENS;
