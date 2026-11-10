/**
 * Pure scoring for the portfolio ranking (KTD1). No imports: the refresh
 * script (`scripts/rank-projects.mjs`) loads this file directly under Node's
 * native type stripping, and the app imports the same file, so there is one
 * set of weights.
 *
 * Higher = more recruiter-ready signals. Rough scale 0 to 250, not normalised.
 * The score never reads video presence, so finished videos cannot reshuffle
 * the pages or the video queue.
 */

const MS_DAY = 86_400_000;

export interface ScoreInput {
  private: boolean;
  hasRepo: boolean;
  liveUrl: boolean;
  demoUrl: boolean;
  embeddable: boolean;
  /** A live or demo URL that is not marked offline. */
  isLive: boolean;
  stars: number;
  highlights: number;
  techStack: number;
  hasArchitecture: boolean;
  descriptionLength: number;
  /** "platform" and "app" projects score a little higher. */
  isPlatformOrApp: boolean;
  /** ISO date of the last push or commit; null when unknown. */
  lastActivity: string | null;
  /** Reference time for recency, so a snapshot never depends on the clock. */
  now: number;
}

export interface ActivityInput {
  commits: number;
  /** A published release exists. */
  hasRelease: boolean;
}

/** Recency bonus by age of the last activity. */
export function recencyScore(iso: string | null, now: number): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  const ageDays = (now - t) / MS_DAY;
  if (ageDays <= 14) return 18;
  if (ageDays <= 45) return 14;
  if (ageDays <= 90) return 10;
  if (ageDays <= 180) return 6;
  if (ageDays <= 365) return 3;
  return 1;
}

/**
 * Completeness: public repo, live demo, stars, highlights, tech stack,
 * architecture note, description length, recency.
 *
 * - Public + GitHub repo linked: +25 / +15 (private: +5, repo +8)
 * - liveUrl (live only): +20, demoUrl: +12, embeddable: +15
 * - stars: +1 each up to +25
 * - highlights: +4 each up to +20; techStack entries: +1 each up to +12
 * - architecture note: +10; description length buckets up to +12
 * - recency: up to +18; platform or app: +4
 */
export function completenessScore(p: ScoreInput): number {
  let s = 0;

  if (!p.private) {
    s += 25;
    if (p.hasRepo) s += 15;
  } else {
    s += 5;
    if (p.hasRepo) s += 8;
  }

  if (p.isLive) {
    if (p.liveUrl) s += 20;
    if (p.demoUrl) s += 12;
    if (p.embeddable) s += 15;
  }

  s += Math.min(25, p.stars);
  s += Math.min(20, p.highlights * 4);
  s += Math.min(12, p.techStack);
  if (p.hasArchitecture) s += 10;

  if (p.descriptionLength > 400) s += 12;
  else if (p.descriptionLength > 200) s += 8;
  else if (p.descriptionLength > 80) s += 4;

  s += recencyScore(p.lastActivity, p.now);
  if (p.isPlatformOrApp) s += 4;

  return s;
}

/**
 * Extended score used for the ranking: completeness plus shipped and
 * activity weights.
 *
 * - live (reachable URL): +10; published release: +10
 * - commits: 1 per 12 up to +30
 */
export function extendedScore(p: ScoreInput, a: ActivityInput): number {
  let s = completenessScore(p);
  if (p.isLive) s += 10;
  if (a.hasRelease) s += 10;
  s += Math.min(30, Math.floor(a.commits / 12));
  return s;
}
