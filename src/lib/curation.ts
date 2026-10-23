import type { CatalogEntry } from "@/data/catalog/schema";

/**
 * The curation bar (R1, KTD5). Source of truth for the numbers is this
 * constant; docs/CURATION.md describes it. Pure and stateless: the sync
 * keeps nothing between runs.
 */
export const CURATION_BAR = {
  minReadmeChars: 400,
  minCommits: 4,
  recentDays: 90,
  minListed: 30,
  maxListed: 40,
  /** Repos matching one of these are mirrors of a listed parent. */
  mirrorPatterns: [/^omarchy-(?!plugins$)/, /^a0-plugin-/],
} as const;

export type CurationVerdict = "listable" | "component-candidate" | "below-bar";

export type CurationGithub = CatalogEntry["github"];

export type CurationResult = { verdict: CurationVerdict; reasons: string[] };

const DAY_MS = 86_400_000;

/** `lastCommitMonth` is "YYYY-MM"; the month counts as recent if its last day is in the window. */
function committedRecently(month: string | null | undefined, now: Date): boolean {
  const m = /^(\d{4})-(\d{2})$/.exec(month ?? "");
  if (!m) return false;
  const monthEnd = Date.UTC(Number(m[1]), Number(m[2]), 1) - DAY_MS;
  return monthEnd >= now.getTime() - CURATION_BAR.recentDays * DAY_MS;
}

function mirrorOf(github: CurationGithub, catalog: readonly CatalogEntry[]): string | null {
  const own = catalog.find((e) => e.github.repoName === github.repoName);
  const parentSlug = own?.curated.parentSlug;
  if (parentSlug && catalog.some((e) => e.slug === parentSlug)) {
    return `component of ${parentSlug}`;
  }
  if (CURATION_BAR.mirrorPatterns.some((p) => p.test(github.repoName))) {
    return "matches a mirror pattern";
  }
  return null;
}

export function scoreRepo(
  github: CurationGithub,
  catalog: readonly CatalogEntry[],
  now: Date,
): CurationResult {
  const mirror = mirrorOf(github, catalog);
  if (mirror) return { verdict: "component-candidate", reasons: [`mirror: ${mirror}`] };

  const reasons: string[] = [];
  if (github.isFork) reasons.push("fork");
  if (github.isArchived) reasons.push("archived");
  const readme = github.readmeLength ?? 0;
  if (readme < CURATION_BAR.minReadmeChars) {
    reasons.push(`README ${readme} chars (< ${CURATION_BAR.minReadmeChars})`);
  }
  const commits = github.commitCount ?? 0;
  if (commits < CURATION_BAR.minCommits) {
    reasons.push(`${commits} commits (< ${CURATION_BAR.minCommits})`);
  }
  if (!committedRecently(github.lastCommitMonth, now) && !github.homepage && !github.latestRelease) {
    reasons.push(`no commits in ${CURATION_BAR.recentDays} days, no live URL, no release`);
  }
  return { verdict: reasons.length ? "below-bar" : "listable", reasons };
}

export type CatalogSummary = {
  listable: number;
  verdicts: Record<string, CurationResult>;
  warning: string | null;
};

/** Warning text when `count` falls outside the target range, else null. `noun` names what was counted. */
export function rangeWarning(count: number, noun: "listable" | "listed"): string | null {
  const { minListed, maxListed } = CURATION_BAR;
  return count < minListed || count > maxListed
    ? `${count} ${noun} projects, outside the ${minListed}-${maxListed} target`
    : null;
}

/** R2: count listable results; warn (never cut) when outside the target range. */
export function summarizeCatalog(catalog: readonly CatalogEntry[], now: Date): CatalogSummary {
  const verdicts: Record<string, CurationResult> = {};
  let listable = 0;
  for (const e of catalog) {
    const r = scoreRepo(e.github, catalog, now);
    verdicts[e.slug] = r;
    if (r.verdict === "listable") listable += 1;
  }
  return { listable, verdicts, warning: rangeWarning(listable, "listable") };
}
