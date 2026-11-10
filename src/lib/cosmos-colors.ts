/**
 * The black-hole scene's own colours: warm white, amber and ember orange,
 * nothing cool. Kept apart from the site palette (lib/palette.ts) on purpose:
 * the scene never uses teal, green or violet, so it cannot pick them up when
 * the site accents change. Shared by the shader, the SVG plate and stardust.
 */
export const HOLE_COLORS = {
  /** White-hot: photon ring, inner disk rim, brightest stars. */
  white: "#FFEBD6",
  /** Hot amber: the disk's inner body. */
  amber: "#FFB46B",
  /** Ember orange: the disk's cooler body and the glow. */
  ember: "#FF5C1A",
  /** Deep ember: the faint outer disk. */
  deep: "#8A2A08",
} as const;
