/**
 * The background's colours: white and the warmest hints of it, nothing cool.
 * A star's `warmth` (0 to 1) blends from white to warm; a few go on to amber.
 * Shared by the shader and the static-still generator.
 */
export const STAR_COLORS = {
  white: "#FFFFFF",
  warm: "#FFE2BD",
  amber: "#FFB46B",
} as const;
