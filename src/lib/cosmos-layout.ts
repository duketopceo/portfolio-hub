/**
 * Where each background body sits, shared by the WebGL scene and the static
 * SVG plate so the two renditions line up. Positions are fractions of the
 * viewport (0,0 top-left); sizes are fractions of the smaller viewport side.
 * Pure data and math: safe for server components and node tests.
 */

export type BodyId = "blackhole" | "rocky" | "gas" | "ice";

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

const WIDE: BodyPlacement[] = [
  { id: "blackhole", x: 0.7, y: 0.36, size: 1.18, parallax: 0.32 },
  { id: "ice", x: 0.965, y: 0.13, size: 0.085, parallax: 0.55 },
  { id: "rocky", x: 0.025, y: 0.86, size: 0.075, parallax: 0.8 },
  { id: "gas", x: 0.93, y: 0.88, size: 0.2, parallax: 0.65 },
];

const TALL: BodyPlacement[] = [
  { id: "blackhole", x: 0.64, y: 0.11, size: 0.95, parallax: 0.32 },
  { id: "ice", x: 0.15, y: 0.56, size: 0.15, parallax: 0.55 },
  { id: "rocky", x: 0.88, y: 0.7, size: 0.11, parallax: 0.8 },
  { id: "gas", x: 0.84, y: 0.94, size: 0.28, parallax: 0.65 },
];

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
