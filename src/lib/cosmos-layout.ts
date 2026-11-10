/**
 * Where the background's one body (the black hole) sits, shared by the WebGL
 * scene and the static SVG plate so the two renditions line up. The hole is
 * small and off-centre so it recedes behind the content; no planets.
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
  /** Diameter of the body (black hole: of the full disk), fraction of min(vw, vh). */
  size: number;
  /** Scroll parallax: how much of a viewport the body travels per viewport scrolled. */
  parallax: number;
}

export type LayoutVariant = "wide" | "tall";

// Small and pushed to the upper right so text columns stay clear of the
// bright ring.
const WIDE: BodyPlacement[] = [{ id: "blackhole", x: 0.8, y: 0.3, size: 0.4, parallax: 0.32 }];

const TALL: BodyPlacement[] = [{ id: "blackhole", x: 0.72, y: 0.1, size: 0.55, parallax: 0.32 }];

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
