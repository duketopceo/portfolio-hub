/**
 * Orbit tour: an optional, slow auto-advance of the focused body.
 *
 * Pure state logic lives here so it can be tested without a DOM. The
 * component wires pointer/key/touch gestures to `interact`, and the Pause or
 * Play button to `pause` and `play`.
 *
 * running           advancing while the map is in view and nobody is on it
 * paused            the visitor pressed Pause; only Play resumes
 * stopped           the visitor used the map (pointer, key, touch); only Play resumes
 */
export type TourState = "running" | "paused" | "stopped";
export type TourAction = "pause" | "play" | "interact";

export const TOUR_INTERVAL_MS = 4500;

export function tourReducer(state: TourState, action: TourAction): TourState {
  switch (action) {
    case "pause":
      return "paused";
    case "play":
      return "running";
    case "interact":
      return state === "running" ? "stopped" : state;
  }
}

export interface TourGate {
  state: TourState;
  /** Map is on screen. */
  inView: boolean;
  /** Pointer is over the stage or focus is inside the section. */
  engaged: boolean;
  /** `prefers-reduced-motion` is not set. */
  motionOk: boolean;
}

/** The tour advances only when every gate is open. */
export function tourShouldAdvance(g: TourGate): boolean {
  return g.state === "running" && g.inView && !g.engaged && g.motionOk;
}

/** Horizontal swipe threshold (px) and dominance over vertical travel. */
export const SWIPE_MIN_PX = 40;

/** -1 previous, 1 next, 0 not a swipe (too short, or mostly vertical scroll). */
export function swipeDirection(dx: number, dy: number): -1 | 0 | 1 {
  if (Math.abs(dx) < SWIPE_MIN_PX) return 0;
  if (Math.abs(dx) < Math.abs(dy) * 1.5) return 0;
  return dx < 0 ? 1 : -1;
}
