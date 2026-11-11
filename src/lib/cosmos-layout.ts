/**
 * Where the background's one body (the black hole) sits, shared by the WebGL
 * scene and the static SVG plate so the two renditions line up. The hole is
 * the whole background: centred horizontally and framing the first screen,
 * its disk wider than the viewport so the wings bleed off both edges.
 * Positions are fractions of the viewport (0,0 top-left); sizes are
 * fractions of the smaller viewport side.
 * Pure data and math: safe for server components and node tests.
 */

export interface BodyPlacement {
  /** Centre, fraction of viewport width / height. */
  x: number;
  y: number;
  /** Diameter of the black shadow, fraction of min(vw, vh). */
  size: number;
}

export type LayoutVariant = "wide" | "tall";

/** Disk outer edge, in shadow radii (BlackHole.tsx R_OUT). */
export const DISK_OUTER = 5.4;
/** The disk spans at least this many viewport widths, so its wings bleed off both edges. */
export const DISK_SPAN = 1.1;

const WIDE: BodyPlacement = { x: 0.5, y: 0.5, size: 0.3 };
const TALL: BodyPlacement = { x: 0.5, y: 0.45, size: 0.2 };

/** Portrait viewports get their own arrangement; everything else is "wide". */
export function layoutVariant(width: number, height: number): LayoutVariant {
  return height > width * 1.05 ? "tall" : "wide";
}

export function bodyPlacement(variant: LayoutVariant): BodyPlacement {
  return variant === "tall" ? TALL : WIDE;
}

/**
 * Shadow radius in "height units" (viewport height = 2): the larger of the
 * layout size and whatever makes the disk span DISK_SPAN viewport widths.
 * The static plate's CSS (cosmos.css) mirrors this formula.
 */
export function shadowRadius(aspect: number, size: number): number {
  return Math.max(size * Math.min(aspect, 1), (aspect * DISK_SPAN) / DISK_OUTER);
}

/**
 * Light level after scrolling `scrollY` px: full at the top, easing down to
 * `floor` by one and a half screens, so the hole stays put and recedes a
 * little instead of leaving.
 */
export function scrollFade(scrollY: number, viewportHeight: number, floor = 0.55): number {
  if (viewportHeight <= 0) return 1;
  const t = Math.min(Math.max(scrollY, 0) / (viewportHeight * 1.5), 1);
  return 1 - (1 - floor) * t;
}
