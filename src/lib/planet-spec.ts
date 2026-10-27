/**
 * PlanetSpec: the declarative description of one planet, authored as
 * `curated.planetVisual` in a catalog JSON file and resolved here into a
 * fully-defaulted spec the scene and the static plate both read.
 *
 * Pure data and math only (no three, no React) so it is testable in node and
 * safe to import from server components. Everything is optional in JSON; the
 * resolver supplies a deterministic default for every missing field, derived
 * from the project's category colour, type and slug.
 */

export const PLANET_SURFACES = [
  "rocky",
  "gas",
  "ice",
  "cratered",
  "terrain",
] as const;
export type PlanetSurface = (typeof PLANET_SURFACES)[number];

/** [low, mid, high] sRGB hex colours: shadows/lowlands, body, highlights/peaks. */
export type PlanetPalette = readonly [string, string, string];

export interface PlanetAtmosphereSpec {
  /** 0 disables the rim; ~0.2 is a thin tint, 0.5 the maximum. */
  strength?: number;
  /** Rim tint (defaults to a light mix of the palette's high colour). */
  color?: string;
}

export interface ResolvedAtmosphere {
  strength: number;
  color: string;
}

/** Ring distances are multiples of the planet radius. */
export interface ResolvedRing {
  color: string;
  /** Overall visibility 0..1 (peak alpha in the scene is about 2x this). */
  opacity: number;
  /** Inclination off the equatorial plane, degrees. */
  tilt: number;
  inner: number;
  outer: number;
  /** Number of dark gaps/bands cut into the ring (0..8). */
  bands: number;
}

export const SPEC_LIMITS = {
  tilt: [-60, 60],
  rotationSpeed: [-0.6, 0.6],
  ringInner: [1.15, 3],
  ringOuter: [1.3, 4.5],
  ringBands: [0, 8],
  atmosphere: [0, 0.5],
} as const;

const clamp = (v: number, [lo, hi]: readonly [number, number]) =>
  Math.min(hi, Math.max(lo, v));

/** FNV-1a over the slug: the single source of per-planet determinism. */
export function slugHash(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic float in [0, 1) from a hash and a salt. */
export function unit(hash: number, salt: number): number {
  let h = (hash ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [0.18, 0.83, 0.75];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as Rgb;
}

export function rgbToHex([r, g, b]: Rgb): string {
  const c = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function mixHex(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex(x.map((v, i) => v + (y[i] - v) * t) as Rgb);
}

const NIGHT = "#070A0D";
const WHITE = "#F2F5F7";
const GREY = "#7C858E";

/** Palette derived from the base colour; shaped per surface type. */
export function derivePalette(base: string, surface: PlanetSurface): PlanetPalette {
  switch (surface) {
    case "gas":
      return [mixHex(base, NIGHT, 0.55), base, mixHex(base, WHITE, 0.6)];
    case "ice":
      return [mixHex(base, NIGHT, 0.35), mixHex(base, WHITE, 0.55), mixHex(base, WHITE, 0.88)];
    case "cratered":
      return [mixHex(mixHex(base, GREY, 0.6), NIGHT, 0.45), mixHex(base, GREY, 0.55), mixHex(base, WHITE, 0.5)];
    case "terrain":
      return [mixHex(base, NIGHT, 0.6), mixHex(base, GREY, 0.2), mixHex(base, WHITE, 0.7)];
    case "rocky":
    default:
      return [mixHex(base, NIGHT, 0.6), mixHex(base, GREY, 0.3), mixHex(base, WHITE, 0.45)];
  }
}

/** Per-surface defaults: how much atmosphere and whether rings are plausible. */
const SURFACE_ATMOSPHERE: Record<PlanetSurface, number> = {
  gas: 0.28,
  ice: 0.22,
  terrain: 0.3,
  rocky: 0.12,
  cratered: 0,
};

/** Default surface when a spec does not choose one. */
export function defaultSurface(type: string, hash: number): PlanetSurface {
  switch (type) {
    case "platform":
      return "gas";
    case "infra":
      return "cratered";
    case "experiment":
      return "ice";
    case "app":
      return "terrain";
    default:
      return PLANET_SURFACES[hash % PLANET_SURFACES.length];
  }
}

export interface AuthoredPlanetSpec {
  surface?: PlanetSurface;
  palette?: readonly [string, string, string];
  seed?: number;
  tilt?: number;
  rotationSpeed?: number;
  atmosphere?: PlanetAtmosphereSpec;
}

export interface AuthoredRing {
  color?: string;
  opacity?: number;
  tilt?: number;
  inner?: number;
  outer?: number;
  bands?: number;
}

export interface ResolvedPlanetLook {
  surface: PlanetSurface;
  palette: PlanetPalette;
  /** Noise offset; same seed, same planet. */
  seed: number;
  /** Axial tilt, degrees (lean of the spin axis from screen-vertical). */
  tilt: number;
  /** Spin, radians per second; sign sets direction. */
  rotationSpeed: number;
  atmosphere: ResolvedAtmosphere;
}

export function resolvePlanetLook(input: {
  slug: string;
  type: string;
  baseColor: string;
  authored?: AuthoredPlanetSpec;
}): ResolvedPlanetLook {
  const { slug, type, baseColor, authored = {} } = input;
  const h = slugHash(slug);
  const surface = authored.surface ?? defaultSurface(type, h);
  const seed = authored.seed ?? Math.floor(unit(h, 1) * 997) + 1;
  const tilt = clamp(
    authored.tilt ?? Math.round((unit(h, 2) * 2 - 1) * 26),
    SPEC_LIMITS.tilt
  );
  const speedMag = 0.05 + unit(h, 3) * 0.07;
  const rotationSpeed = clamp(
    authored.rotationSpeed ?? (unit(h, 4) < 0.2 ? -speedMag : speedMag),
    SPEC_LIMITS.rotationSpeed
  );
  const palette = authored.palette ?? derivePalette(baseColor, surface);
  const atmosphere: ResolvedAtmosphere = {
    strength: clamp(
      authored.atmosphere?.strength ?? SURFACE_ATMOSPHERE[surface],
      SPEC_LIMITS.atmosphere
    ),
    color: authored.atmosphere?.color ?? mixHex(palette[2], WHITE, 0.35),
  };
  return { surface, palette, seed, tilt, rotationSpeed, atmosphere };
}

export function resolveRing(
  ring: AuthoredRing,
  fallbackColor: string,
  prevOuter?: number
): ResolvedRing {
  const inner = clamp(
    ring.inner ?? (prevOuter === undefined ? 1.45 : prevOuter + 0.12),
    SPEC_LIMITS.ringInner
  );
  return {
    color: ring.color ?? fallbackColor,
    opacity: Math.min(1, Math.max(0, ring.opacity ?? 0.3)),
    tilt: clamp(ring.tilt ?? 0, SPEC_LIMITS.tilt),
    inner,
    outer: Math.max(inner + 0.1, clamp(ring.outer ?? inner + 0.55, SPEC_LIMITS.ringOuter)),
    bands: Math.round(clamp(ring.bands ?? 3, SPEC_LIMITS.ringBands)),
  };
}
