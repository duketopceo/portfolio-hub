/**
 * The star field behind every page: a deterministic list of stars shared by
 * the WebGL layer (components/scene/Starfield.tsx) and the static stills
 * (scripts/generate-starfield-still.mjs), so the live and static sky are made
 * the same way. Pure data and math: safe for server code, node tests and the
 * generator script (which loads this file directly, so it has no imports).
 *
 * Three parallax layers: many faint far stars, fewer mid stars, a handful of
 * bright near stars. Size and brightness are skewed so most stars are dim and
 * a few stand out, like a real sky.
 */

export interface Star {
  /** Position as a fraction of the viewport, 0 to 1 (0,0 top-left). */
  x: number;
  y: number;
  /** Parallax depth: small is far (moves least), 1 is nearest. */
  depth: number;
  /** Diameter in CSS pixels. */
  size: number;
  /** Peak brightness, 0 to 1. */
  brightness: number;
  /** Twinkle phase, radians. */
  phase: number;
  /** Twinkle depth: 0 for a steady star, up to 0.25. */
  twinkle: number;
  /** 0 white to 1 warm; above 0.85 the star leans amber. */
  warmth: number;
}

/** Layers from far to near: share of the stars, depth, size range (px), brightness range. */
const LAYERS = [
  { share: 0.62, depth: 0.2, size: [0.8, 1.3], bright: [0.2, 0.6] },
  { share: 0.28, depth: 0.5, size: [1.0, 1.7], bright: [0.3, 0.75] },
  { share: 0.1, depth: 1.0, size: [1.5, 2.5], bright: [0.5, 0.95] },
] as const;

/** Park-Miller, the same generator as components/scene/random.ts (kept local: no imports). */
function rng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** `count` stars from `seed`; the same arguments always give the same sky. */
export function generateStars(count: number, seed = 20261114): Star[] {
  const rand = rng(seed);
  const stars: Star[] = [];
  LAYERS.forEach((layer, li) => {
    const n = li === LAYERS.length - 1 ? count - stars.length : Math.round(count * layer.share);
    for (let i = 0; i < n; i++) {
      // Squaring skews toward the low end: most stars faint and small.
      const k = rand() ** 2.2;
      const sizeK = rand() ** 1.8;
      stars.push({
        x: rand(),
        y: rand(),
        depth: layer.depth,
        size: layer.size[0] + (layer.size[1] - layer.size[0]) * sizeK,
        brightness: layer.bright[0] + (layer.bright[1] - layer.bright[0]) * k,
        phase: rand() * Math.PI * 2,
        twinkle: rand() < 0.4 ? 0.08 + rand() * 0.17 : 0,
        // Mostly white; about a fifth warm, a few amber.
        warmth: rand() < 0.2 ? 0.45 + rand() * 0.55 : rand() * 0.2,
      });
    }
  });
  return stars;
}
