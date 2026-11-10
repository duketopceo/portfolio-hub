import { COSMOS_PALETTE } from "@/lib/palette";

/**
 * Falling starlight: pure helpers for the stardust canvas. No DOM, no
 * canvas; the component owns drawing and the frame loop.
 */

export interface Mote {
  x: number;
  y: number;
  /** Fall speed, px/s. */
  vy: number;
  /** Sideways sway amplitude (px) and phase. */
  sway: number;
  phase: number;
  /** Radius, px. */
  r: number;
  /** Base alpha 0..1. */
  alpha: number;
  /** Index into STARDUST_COLORS. */
  color: number;
}

/** Weighted: mostly starlight, some grey, a little pop, rare ember. */
export const STARDUST_COLORS: readonly string[] = [
  COSMOS_PALETTE.starlight,
  COSMOS_PALETTE.slate,
  COSMOS_PALETTE.pop,
  COSMOS_PALETTE.ember,
];
const COLOR_WEIGHTS = [0.55, 0.22, 0.18, 0.05] as const;

/** How many motes: sparse by design, fewer on narrow screens. */
export function moteCount(width: number): number {
  if (width <= 0) return 0;
  return Math.max(14, Math.min(44, Math.round(width / 38)));
}

/**
 * 0 at the top of the page, 1 once the visitor is `ramp` viewport-heights
 * down. The layer is idle (no frames) at 0 and fades in as it rises.
 */
export function dustProgress(scrollY: number, viewportHeight: number, ramp = 0.9): number {
  if (viewportHeight <= 0) return 0;
  const t = Math.max(scrollY, 0) / (viewportHeight * ramp);
  return Math.min(1, t);
}

export function pickColor(u: number): number {
  let acc = 0;
  for (let i = 0; i < COLOR_WEIGHTS.length; i++) {
    acc += COLOR_WEIGHTS[i];
    if (u < acc) return i;
  }
  return 0;
}

export function spawnMote(rand: () => number, width: number, height: number, fromTop: boolean): Mote {
  return {
    x: rand() * width,
    y: fromTop ? -8 - rand() * 40 : rand() * height,
    vy: 9 + rand() * 18,
    sway: 4 + rand() * 12,
    phase: rand() * Math.PI * 2,
    r: 0.6 + rand() * rand() * 1.9,
    alpha: 0.35 + rand() * 0.55,
    color: pickColor(rand()),
  };
}

export function seedMotes(rand: () => number, width: number, height: number): Mote[] {
  return Array.from({ length: moteCount(width) }, () => spawnMote(rand, width, height, false));
}

/**
 * Advance one mote. `scrollDelta` (px scrolled since the last frame) nudges
 * motes the opposite way so they feel attached to the page, not the glass.
 * Returns true when the mote left the bottom and should respawn.
 */
export function stepMote(m: Mote, dt: number, height: number, scrollDelta: number): boolean {
  m.y += m.vy * dt - scrollDelta * 0.35;
  m.phase += dt * 0.6;
  return m.y > height + 12 || m.y < -80;
}

/** Horizontal position including sway. */
export function moteX(m: Mote): number {
  return m.x + Math.sin(m.phase) * m.sway;
}

/** Soft twinkle in 0.55..1, slow enough not to read as flicker. */
export function twinkle(m: Mote, time: number): number {
  return 0.775 + 0.225 * Math.sin(time * 1.3 + m.phase * 3);
}

/**
 * Deterministic points for the static (reduced-motion / no-WebGL) rendition:
 * the same colour mix, scattered over a tile in 0..1 coordinates.
 */
export function staticDust(seed: number, count: number): { x: number; y: number; r: number; alpha: number; color: number }[] {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    r: 0.6 + rand() * rand() * 1.9,
    alpha: 0.3 + rand() * 0.5,
    color: pickColor(rand()),
  }));
}
