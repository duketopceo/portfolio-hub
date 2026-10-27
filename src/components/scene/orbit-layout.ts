/** Pure scene math for the orbital scene: slot layout and moon motion. */

export interface OrbitSlot {
  /** Position in scene units on the orbit plane (y = 0). */
  x: number;
  z: number;
  /** Polar angle on the ellipse. */
  angle: number;
  /** Which concentric ring the body sits on (0 = outermost). */
  ring: number;
  /** Label sits above the body on the far half, below on the near half. */
  labelAbove: boolean;
}

/** Label footprint in screen-ish units (z is foreshortened by RING_FORESHORTEN). */
export const LABEL_BOX = { w: 4.4, h: 1.7 } as const;
const BODY_BOX = { w: 2.8, h: 1.8 } as const;
const FORESHORTEN = 0.5;
const RING_STEP = 0.2;
const MAX_RINGS = 4;
/** Label offset from the body centre along screen y. */
const LABEL_DY = 1.15;

export function ringScale(ring: number): number {
  return 1 - ring * RING_STEP;
}

function boxes(s: OrbitSlot) {
  const sy = s.z * FORESHORTEN;
  const ly = sy + (s.labelAbove ? -LABEL_DY : LABEL_DY);
  return [
    { x: s.x, y: sy, w: BODY_BOX.w, h: BODY_BOX.h },
    { x: s.x, y: ly, w: LABEL_BOX.w, h: LABEL_BOX.h },
  ];
}

/** True when any body or label box of the two slots intersect. */
export function slotsOverlap(a: OrbitSlot, b: OrbitSlot): boolean {
  for (const p of boxes(a)) {
    for (const q of boxes(b)) {
      if (
        Math.abs(p.x - q.x) < (p.w + q.w) / 2 &&
        Math.abs(p.y - q.y) < (p.h + q.h) / 2
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Bodies start on one evenly spaced ring (identical angles to the SSR plate,
 * so the plate-to-scene swap does not jump). A body whose box would collide
 * with an already placed one steps inward to the next concentric ring.
 */
export function orbitLayout(n: number, rx: number, rz: number): OrbitSlot[] {
  const placed: OrbitSlot[] = [];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
    let chosen: OrbitSlot | null = null;
    for (let ring = 0; ring < MAX_RINGS; ring++) {
      const k = ringScale(ring);
      const slot: OrbitSlot = {
        x: rx * k * Math.cos(angle),
        z: rz * k * Math.sin(angle),
        angle,
        ring,
        labelAbove: Math.sin(angle) < 0,
      };
      chosen = slot;
      if (!placed.some((p) => slotsOverlap(p, slot))) break;
    }
    placed.push(chosen as OrbitSlot);
  }
  return placed;
}

/**
 * Offset of a moon from its planet at time t (seconds). Moons spread evenly
 * around the planet and drift at slightly different rates; the orbit is a
 * tilted ellipse so it reads as a plate rather than a flat circle.
 */
export function moonOffset(
  moonIndex: number,
  moonCount: number,
  t: number,
  radius: number
): [number, number, number] {
  const a =
    (moonIndex / Math.max(moonCount, 1)) * Math.PI * 2 +
    t * (0.25 + 0.07 * moonIndex);
  return [
    radius * Math.cos(a),
    radius * 0.2 * Math.sin(a),
    radius * 0.55 * Math.sin(a),
  ];
}

/** Orbit radii (rem) follow the stage width, mirroring the plate's CSS:
 *  `--orbit-rx: clamp(7rem, 50cqw - 4.5rem, 25rem)` and ry = rx / 2, with a
 *  rounder orbit (ry = 0.8 rx, 3.5rem margin) at 34rem and below. Keep the two
 *  in sync (see `.solar-plate` in globals.css). */
export function orbitRadiiRem(stageWidthPx: number): { rx: number; ry: number } {
  const narrow = stageWidthPx / 16 <= 34;
  const rx = Math.min(25, Math.max(7, stageWidthPx / 32 - (narrow ? 3.5 : 4.5)));
  return { rx, ry: rx * (narrow ? 0.8 : 0.5) };
}

