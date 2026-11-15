import type { ShowcaseCardData, ShowcaseTier } from "@/lib/types";

/**
 * Entries kept out of the showcase card system: Bartlett work is not shown
 * under Cosmic branding, so it gets no generated poster or card slots.
 */
export const SHOWCASE_EXCLUDED: ReadonlySet<string> = new Set(["bartlett-permits"]);

export function isShowcaseEligible(slug: string): boolean {
  return !SHOWCASE_EXCLUDED.has(slug);
}

export const TIER_LABEL: Record<ShowcaseTier, string> = {
  A: "Full video",
  B: "Short video, 15 s or more",
  C: "Looping clip only",
};

/** FNV-1a: a stable 32-bit seed from a slug. */
export function seedFromSlug(slug: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small deterministic PRNG returning floats in [0, 1). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** True when the loop URL is an animated image rather than a video file. */
export function isImageLoop(url: string): boolean {
  return /\.gif(\?|$)/i.test(url);
}

/** The card slots for a project, or undefined for excluded entries. */
export function cardOf(project: {
  slug: string;
  showcaseCard?: ShowcaseCardData;
}): ShowcaseCardData | undefined {
  return isShowcaseEligible(project.slug) ? project.showcaseCard : undefined;
}
