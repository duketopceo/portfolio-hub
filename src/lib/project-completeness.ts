import type { EnrichedProject } from "@/lib/types";

/**
 * Portfolio "completeness" score for homepage solar-orbit ordering.
 *
 * Higher = more recruiter-ready signals (live demo, public activity, rich metadata).
 * Tune weights here only — UI reads sorted order from sortProjectsByCompleteness().
 *
 * Rough scale: ~0–200+ (not normalized to 0–100).
 *
 * Weights (current):
 * - Public + GitHub repo linked: +25 / +15
 * - liveUrl: +20, demoUrl: +12, embeddable: +15
 * - stars: +1 each up to +25
 * - highlights: +4 each up to +20, techStack entries: +1 each up to +12
 * - architecture string: +10, description length buckets: up to +12
 * - lastUpdated: up to +18 decay (90d full, older tapers)
 * - Private without repo: small base only
 */

const MS_DAY = 86_400_000;

function recencyScore(isoDate: string): number {
  const t = new Date(isoDate).getTime();
  if (Number.isNaN(t)) return 0;
  const ageDays = (Date.now() - t) / MS_DAY;
  if (ageDays <= 14) return 18;
  if (ageDays <= 45) return 14;
  if (ageDays <= 90) return 10;
  if (ageDays <= 180) return 6;
  if (ageDays <= 365) return 3;
  return 1;
}

export function scoreProjectCompleteness(p: EnrichedProject): number {
  let s = 0;

  if (!p.private) {
    s += 25;
    if (p.repo) s += 15;
  } else {
    s += 5;
    if (p.repo) s += 8;
  }

  if (p.liveUrl) s += 20;
  if (p.demoUrl) s += 12;
  if (p.embeddable) s += 15;

  s += Math.min(25, p.stars);

  const hl = p.highlights?.length ?? 0;
  s += Math.min(20, hl * 4);

  const ts = p.techStack?.length ?? 0;
  s += Math.min(12, ts);

  if (p.architecture && p.architecture.trim().length > 0) s += 10;

  const descLen = (p.description ?? "").trim().length;
  if (descLen > 400) s += 12;
  else if (descLen > 200) s += 8;
  else if (descLen > 80) s += 4;

  if (p.lastUpdated) s += recencyScore(p.lastUpdated);

  if (p.type === "platform" || p.type === "app") s += 4;

  return s;
}

export function sortProjectsByCompleteness(
  projects: EnrichedProject[]
): EnrichedProject[] {
  return [...projects].sort((a, b) => {
    const db = scoreProjectCompleteness(b);
    const da = scoreProjectCompleteness(a);
    if (db !== da) return db - da;
    return a.displayName.localeCompare(b.displayName);
  });
}
