/**
 * The background's colours: white, the warm off-white tint, and the amber
 * accent on a few stars. Nothing cool. A star's `warmth` (0 to 1) blends from
 * white to the tint; the warmest few go on to amber. Shared by the shader and
 * the static-still generator; values mirror COSMOS_PALETTE.
 */
export const STAR_COLORS = {
  white: "#FFFFFF",
  warm: "#F2EFEA",
  amber: "#FF9F1C",
} as const;
