/**
 * Where the background's one body (the black hole) sits, shared by the WebGL
 * scene and the static SVG plate so the two renditions line up. The hole is
 * full-screen: its disk spans most of the viewport width; no planets.
 * Positions are fractions of the viewport (0,0 top-left); sizes are
 * fractions of the smaller viewport side.
 * Pure data and math: safe for server components and node tests.
 */

export type BodyId = "blackhole";

export interface BodyPlacement {
  id: BodyId;
  /** Centre, fraction of viewport width / height. */
  x: number;
  y: number;
  /** Diameter of the hole's black shadow, fraction of min(vw, vh). The disk spans ~5x this. */
  size: number;
  /** Scroll parallax: how much of a viewport the body travels per viewport scrolled. */
  parallax: number;
}

export type LayoutVariant = "wide" | "tall";

// Wide: the hole sits a little right of centre and above the middle so the
// disk's wings run across the whole viewport. Tall: centred high, the disk
// is cropped by the screen edges.
const WIDE: BodyPlacement[] = [{ id: "blackhole", x: 0.58, y: 0.42, size: 0.27, parallax: 0.32 }];

const TALL: BodyPlacement[] = [{ id: "blackhole", x: 0.5, y: 0.3, size: 0.5, parallax: 0.32 }];

/** Portrait viewports get their own arrangement; everything else is "wide". */
export function layoutVariant(width: number, height: number): LayoutVariant {
  return height > width * 1.05 ? "tall" : "wide";
}

export function cosmosLayout(variant: LayoutVariant): BodyPlacement[] {
  return variant === "tall" ? TALL : WIDE;
}

export function bodyPlacement(variant: LayoutVariant, id: BodyId): BodyPlacement {
  const found = cosmosLayout(variant).find((b) => b.id === id);
  if (!found) throw new Error(`unknown cosmos body: ${id}`);
  return found;
}

/**
 * Vertical offset in viewport fractions after scrolling `scrollY` px.
 * Bodies drift up and away; clamped so nothing travels forever.
 */
export function scrollOffset(scrollY: number, viewportHeight: number, parallax: number): number {
  if (viewportHeight <= 0) return 0;
  const screens = Math.min(Math.max(scrollY, 0) / viewportHeight, 6);
  return -screens * parallax;
}

/**
 * Visibility of a body as the page scrolls, from the viewport fraction of its
 * lowest edge: fully visible while that edge is on screen, fading to 0 as it
 * leaves through the top.
 */
export function bodyOpacity(bottomEdge: number): number {
  if (bottomEdge >= 0.18) return 1;
  if (bottomEdge <= -0.05) return 0;
  return (bottomEdge + 0.05) / 0.23;
}
