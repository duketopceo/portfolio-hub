import { CAPABILITY_IDS, capabilityMeta, isCapabilityId, type CapabilityId } from "@/data/capability-meta";
import { seededRandom } from "@/components/scene/random";
import { RANKING_PINS } from "@/data/ranking-pins";

/**
 * Data for the gravity map. It adds no taxonomy of its own: the heroes are the
 * pinned leads (`ranking-pins.ts`), the centres are the capability groups
 * (`capability-meta.ts`), and membership is each project's own `capability`.
 */

/** The slice of a ranked project the map reads. No repo identifiers. */
export interface GravityInput {
  slug: string;
  displayName: string;
  tagline: string;
  capability?: string;
  outcome?: string;
}

export interface GravityDot {
  slug: string;
  name: string;
  capability: CapabilityId;
}

export interface GravityHero extends GravityDot {
  /** One line on what the project does, from the catalog `outcome`. */
  why: string;
}

export interface GravityCentre {
  id: CapabilityId;
  label: string;
  color: string;
  /** Every listed project in the group, leads included. */
  count: number;
  /** The group's projects that are not leads, strongest first. */
  members: GravityDot[];
}

export interface GravityMapData {
  heroes: GravityHero[];
  centres: GravityCentre[];
  total: number;
}

/** The serializable slice of a ranked project the map reads. */
export function toGravityInput(
  ranked: readonly GravityInput[]
): GravityInput[] {
  return ranked.map((p) => ({
    slug: p.slug,
    displayName: p.displayName,
    tagline: p.tagline,
    capability: p.capability,
    outcome: p.outcome,
  }));
}

/** `ranked` is the ranked list from `rankProjects`; its order is kept. */
export function buildGravityMap(
  ranked: readonly GravityInput[],
  pins: readonly string[] = RANKING_PINS
): GravityMapData {
  const bySlug = new Map(ranked.map((p) => [p.slug, p] as const));
  const pinSet = new Set(pins);

  const heroes: GravityHero[] = [];
  for (const slug of pins) {
    const p = bySlug.get(slug);
    if (!p || !isCapabilityId(p.capability)) continue;
    heroes.push({
      slug: p.slug,
      name: p.displayName,
      capability: p.capability,
      why: p.outcome ?? p.tagline,
    });
  }

  const centres: GravityCentre[] = CAPABILITY_IDS.map((id) => {
    const inGroup = ranked.filter((p) => p.capability === id);
    return {
      id,
      label: capabilityMeta[id].label,
      color: capabilityMeta[id].color,
      count: inGroup.length,
      members: inGroup
        .filter((p) => !pinSet.has(p.slug))
        .map((p) => ({ slug: p.slug, name: p.displayName, capability: id })),
    };
  });

  return { heroes, centres, total: centres.reduce((n, c) => n + c.count, 0) };
}

/** Layout frames: a wide one for desktop and a tall one for phones. */
export interface GravityFrame {
  w: number;
  h: number;
}
export const WIDE_FRAME: GravityFrame = { w: 960, h: 560 };
export const TALL_FRAME: GravityFrame = { w: 400, h: 640 };

/** Vertical flattening of the two orbit systems (own values, tuned by eye). */
export const LEAD_FLATTEN = 0.62;
export const MEMBER_FLATTEN = 0.78;
/** Member ring radii in frame units; inner ring first. */
export const MEMBER_RINGS = [24, 40, 56] as const;

export interface Placed {
  x: number;
  y: number;
}

/** Radii of the ellipse the capability centres sit on. Leaves room above and below for labels. */
export function centreOrbit(frame: GravityFrame): { rx: number; ry: number } {
  const wide = frame.w > frame.h;
  return wide
    ? { rx: frame.w * 0.4, ry: frame.h * 0.32 }
    : { rx: frame.w * 0.36, ry: frame.h * 0.34 };
}

/** Centre positions, one per capability, spread on an ellipse starting at the top. */
export function centrePositions(count: number, frame: GravityFrame): Placed[] {
  const cx = frame.w / 2;
  const cy = frame.h / 2;
  const { rx, ry } = centreOrbit(frame);
  return Array.from({ length: count }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / count;
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  });
}

/** Lead positions on the inner ellipse at orbit phase `t` (radians). */
export function leadPositions(count: number, frame: GravityFrame, t: number): Placed[] {
  const wide = frame.w > frame.h;
  const cx = frame.w / 2;
  const cy = frame.h / 2;
  const rx = wide ? frame.w * 0.17 : frame.w * 0.2;
  const ry = wide ? rx * LEAD_FLATTEN : frame.h * 0.13;
  return Array.from({ length: count }, (_, i) => {
    const a = -Math.PI / 2 + t + (i * 2 * Math.PI) / count;
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  });
}

export interface Jitter {
  /** Radians added to the slot angle. */
  a: number;
  /** Fraction of the ring radius added or removed. */
  r: number;
}

/** Small seeded offsets so the rings read as scatter, not a lattice. */
export function memberJitter(count: number, seed: number): Jitter[] {
  const rand = seededRandom(seed * 7919 + 13);
  return Array.from({ length: count }, () => ({ a: (rand() - 0.5) * 0.7, r: (rand() - 0.5) * 0.24 }));
}

/** Member positions around a centre at phase `t`: three rings, alternating spin. */
export function memberPositions(
  count: number,
  centre: Placed,
  t: number,
  jitter: readonly Jitter[] = []
): Placed[] {
  return Array.from({ length: count }, (_, k) => {
    const ring = k % MEMBER_RINGS.length;
    const slot = Math.floor(k / MEMBER_RINGS.length);
    const perRing = Math.ceil(count / MEMBER_RINGS.length);
    const dir = ring % 2 === 0 ? 1 : -1;
    const j = jitter[k] ?? { a: 0, r: 0 };
    const a = (slot * 2 * Math.PI) / perRing + ring * 1.1 + j.a + dir * t * (1 - ring * 0.25);
    const r = MEMBER_RINGS[ring] * (1 + j.r);
    return { x: centre.x + r * Math.cos(a), y: centre.y + r * MEMBER_FLATTEN * Math.sin(a) };
  });
}

/** Window event the map dispatches to apply a capability group in the filter bar. */
export const GROUP_EVENT = "projects:group";
