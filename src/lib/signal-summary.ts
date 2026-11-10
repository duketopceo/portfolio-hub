import type {
  ActivityDayBucket,
  ActivityEventKind,
  ActivityTimelineItem,
  ProjectActivityPayload,
} from "@/lib/github-activity-types";

/**
 * Server-side summary behind the home "engineering signal" glance.
 * Pure functions only: the raw 90-day history never leaves the server, the
 * client (none needed) would receive just these few numbers per project.
 */

export const SIGNAL_HEAT_DAYS = 7;
export const SIGNAL_LONG_DAYS = 30;
/** Moving rows shown on the home page; the rest collapse into a link. */
export const SIGNAL_MAX_MOVING = 8;
export const SIGNAL_MORE_HREF = "/projects";
const PRIVATE_NAME = "Private project";
const MS_DAY = 86_400_000;

/** 0 = quiet, 4 = busiest. Never conveyed by color alone (bar height + count). */
export type SignalLevel = 0 | 1 | 2 | 3 | 4;

/** Event kinds the signal knows: the timeline kinds plus commits. */
export type SignalKind = ActivityEventKind | "commit";

/**
 * Per repository and calendar day, from the one account-wide contributions
 * call. Commit days are GitHub's local contribution dates; PR and issue days
 * are UTC dates (see commitContributionDay).
 */
export interface ContributionDay {
  date: string;
  commits: number;
  prsOpened: number;
  issuesOpened: number;
}

/** One catalog project's contributions. No titles, messages or repo names. */
export interface SignalContribution {
  slug: string;
  displayName: string;
  catalogPrivate: boolean;
  githubPrivate: boolean;
  days: ContributionDay[];
}

export interface SignalCounts {
  commits: number;
  merged: number;
  opened: number;
  releases: number;
  /** Issues opened + closed. */
  issues: number;
}

export interface SignalRow {
  slug: string;
  displayName: string;
  private: boolean;
  href: string;
  state: "moving" | "quiet";
  /** Oldest to newest, one entry per UTC day, length SIGNAL_HEAT_DAYS. */
  heat: Array<{ date: string; count: number; level: SignalLevel }>;
  counts7: SignalCounts;
  events7: number;
  events30: number;
  /** Latest event kind, or null when there is no event in the history. */
  lastKind: SignalKind | null;
  lastAt: string | null;
  /** One line. Private repos get a generic kind line, never a title. */
  lastLine: string | null;
  /** Whole days since the latest event (0 = today), or null. */
  lastAgeDays: number | null;
}

export interface SignalSummary {
  rows: SignalRow[];
  movingCount: number;
  /** Moving projects beyond SIGNAL_MAX_MOVING, collapsed into one link. */
  hiddenMovingCount: number;
  moreHref: string;
  /** Listed catalog projects the signal considers: the "of M" denominator. */
  totalCount: number;
  events7: number;
  fetchedAt: string;
  source: "github" | "fixture" | "empty";
}

const KIND_NOUN: Record<SignalKind, string> = {
  commit: "Commits pushed",
  pr_opened: "PR opened",
  pr_merged: "PR merged",
  pr_closed: "PR closed",
  review: "PR reviewed",
  release: "Release cut",
  issue_opened: "Issue started",
  issue_closed: "Issue finished",
};

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayDiff(now: Date, at: Date): number {
  const a = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const b = Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate());
  return Math.round((a - b) / MS_DAY);
}

/** "today", "yesterday", "5d ago". Day granularity survives hourly caching. */
export function formatAge(days: number | null): string {
  if (days === null) return "no recent events";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export function levelFor(count: number, max: number): SignalLevel {
  if (count <= 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

/** Reviews are noise for "what moved"; they only count as a last resort. */
function isMovement(item: ActivityTimelineItem): boolean {
  return item.kind !== "review";
}

function latestItem(
  items: ActivityTimelineItem[],
  now: Date
): ActivityTimelineItem | null {
  const valid = items.filter((i) => {
    const t = new Date(i.at).getTime();
    return !Number.isNaN(t) && t <= now.getTime() + MS_DAY;
  });
  const pool = valid.some(isMovement) ? valid.filter(isMovement) : valid;
  if (pool.length === 0) return null;
  return pool.reduce((best, i) =>
    new Date(i.at).getTime() > new Date(best.at).getTime() ? i : best
  );
}

function lineFor(item: ActivityTimelineItem, isPrivate: boolean): string {
  // Private repos: kind only. Titles and refs could identify the work.
  if (isPrivate) return KIND_NOUN[item.kind];
  return item.label;
}

export function summarizeProject(
  payload: ProjectActivityPayload,
  now: Date,
  commitDays: ContributionDay[] = []
): SignalRow {
  const dates: string[] = [];
  for (let i = SIGNAL_HEAT_DAYS - 1; i >= 0; i--) {
    dates.push(dateKey(new Date(now.getTime() - i * MS_DAY)));
  }
  const since30 = dateKey(
    new Date(now.getTime() - (SIGNAL_LONG_DAYS - 1) * MS_DAY)
  );
  const today = dateKey(now);
  const heatSet = new Set(dates);

  const counts7: SignalCounts = {
    commits: 0,
    merged: 0,
    opened: 0,
    releases: 0,
    issues: 0,
  };
  const perDay = new Map<string, number>();
  let events30 = 0;

  for (const day of payload.days) {
    if (day.date > today) continue;
    const n =
      day.prsMerged + day.prsOpened + day.releases + day.issuesOpened +
      day.issuesClosed;
    if (day.date >= since30) events30 += n;
    if (heatSet.has(day.date)) {
      perDay.set(day.date, (perDay.get(day.date) ?? 0) + n);
      counts7.merged += day.prsMerged;
      counts7.opened += day.prsOpened;
      counts7.releases += day.releases;
      counts7.issues += day.issuesOpened + day.issuesClosed;
    }
  }

  let lastCommitDate: string | null = null;
  for (const day of commitDays) {
    if (day.date > today || day.commits <= 0) continue;
    if (day.date >= since30) events30 += day.commits;
    if (heatSet.has(day.date)) {
      perDay.set(day.date, (perDay.get(day.date) ?? 0) + day.commits);
      counts7.commits += day.commits;
    }
    if (!lastCommitDate || day.date > lastCommitDate) lastCommitDate = day.date;
  }

  const max = Math.max(0, ...dates.map((d) => perDay.get(d) ?? 0));
  const heat = dates.map((date) => {
    const count = perDay.get(date) ?? 0;
    return { date, count, level: levelFor(count, max) };
  });
  const events7 = heat.reduce((s, h) => s + h.count, 0);

  const lastItem = latestItem(payload.items, now);
  // Contribution days carry no time of day; an item on the same day wins.
  const commitAt = lastCommitDate ? `${lastCommitDate}T00:00:00.000Z` : null;
  const commitIsLatest =
    commitAt !== null &&
    (!lastItem || new Date(commitAt).getTime() > new Date(lastItem.at).getTime());
  const lastAt = commitIsLatest ? commitAt : (lastItem?.at ?? null);
  const lastKind: SignalKind | null = commitIsLatest
    ? "commit"
    : (lastItem?.kind ?? null);
  const lastLine = commitIsLatest
    ? KIND_NOUN.commit
    : lastItem
      ? lineFor(lastItem, payload.private)
      : null;
  const lastAgeDays = lastAt ? Math.max(0, dayDiff(now, new Date(lastAt))) : null;

  return {
    slug: payload.slug,
    displayName: payload.displayName,
    private: payload.private,
    href: `/projects/${payload.slug}`,
    state: events7 > 0 ? "moving" : "quiet",
    heat,
    counts7,
    events7,
    events30,
    lastKind,
    lastAt,
    lastLine,
    lastAgeDays,
  };
}

function byRecency(a: SignalRow, b: SignalRow): number {
  const at = a.lastAt ? new Date(a.lastAt).getTime() : 0;
  const bt = b.lastAt ? new Date(b.lastAt).getTime() : 0;
  return bt - at || a.displayName.localeCompare(b.displayName);
}

/** Moving first (most events, then most recent), then quiet (most recent). */
export function compareSignalRows(a: SignalRow, b: SignalRow): number {
  if (a.state !== b.state) return a.state === "moving" ? -1 : 1;
  if (a.state === "moving" && a.events7 !== b.events7) {
    return b.events7 - a.events7;
  }
  return byRecency(a, b);
}

/**
 * A catalog project found only through the contributions call: opened PRs,
 * opened issues and commits, as day counts. Lines are generic kind nouns.
 */
function contributionOnlyPayload(
  c: SignalContribution,
  isPrivate: boolean,
  fetchedAt: string
): ProjectActivityPayload {
  const days: ActivityDayBucket[] = [];
  const items: ActivityTimelineItem[] = [];
  for (const d of c.days) {
    if (d.prsOpened <= 0 && d.issuesOpened <= 0) continue;
    const at = `${d.date}T00:00:00.000Z`;
    days.push({
      date: d.date,
      prsOpened: d.prsOpened,
      prsMerged: 0,
      reviews: 0,
      releases: 0,
      issuesOpened: d.issuesOpened,
      issuesClosed: 0,
      items: [],
    });
    if (d.prsOpened > 0) {
      items.push({ id: `${c.slug}-pr-${d.date}`, kind: "pr_opened", at, label: KIND_NOUN.pr_opened });
    }
    if (d.issuesOpened > 0) {
      items.push({ id: `${c.slug}-issue-${d.date}`, kind: "issue_opened", at, label: KIND_NOUN.issue_opened });
    }
  }
  return {
    slug: c.slug,
    displayName: c.displayName,
    private: isPrivate,
    headline: "",
    days,
    items,
    fetchedAt,
    source: "github",
  };
}

/**
 * Fail closed: GitHub reporting a repository private while the catalog says
 * public means the name itself must not render. Catalog-private projects keep
 * the #96 behaviour (curated name plus lock, kind-only lines).
 */
function conceal(row: SignalRow, n: number): SignalRow {
  return {
    ...row,
    slug: `private-${n}`,
    displayName: PRIVATE_NAME,
    private: true,
    href: SIGNAL_MORE_HREF,
    lastLine: row.lastKind ? KIND_NOUN[row.lastKind] : null,
  };
}

export function buildSignalSummary(
  payloads: ProjectActivityPayload[],
  meta: {
    fetchedAt: string;
    source: SignalSummary["source"];
    /**
     * Slugs GitHub positively reported public in data fetched this revalidate
     * (repo metadata `private: false`). A contributions entry with isPrivate
     * false counts too. Absent means unknown, which is concealed.
     */
    publicSlugs?: readonly string[];
    /** Listed catalog projects considered; defaults to the rows built. */
    totalProjects?: number;
  },
  contributions: SignalContribution[] = []
): SignalSummary {
  const parsed = new Date(meta.fetchedAt);
  const now = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const bySlug = new Map(contributions.map((c) => [c.slug, c] as const));
  const publicSlugs = new Set(meta.publicSlugs ?? []);
  let concealed = 0;

  const rows: SignalRow[] = payloads.map((p) => {
    const c = bySlug.get(p.slug);
    // Fail closed: a catalog-public project shows its name only when GitHub
    // positively said public this revalidate and nothing said private.
    const positivelyPublic =
      !c?.githubPrivate && (publicSlugs.has(p.slug) || c?.githubPrivate === false);
    const hide = !p.private && !positivelyPublic;
    const effective = hide ? { ...p, private: true } : p;
    const row = summarizeProject(effective, now, c?.days);
    return hide ? conceal(row, ++concealed) : row;
  });

  const featured = new Set(payloads.map((p) => p.slug));
  for (const c of contributions) {
    if (featured.has(c.slug)) continue;
    const hide = c.githubPrivate && !c.catalogPrivate;
    const payload = contributionOnlyPayload(c, c.catalogPrivate || c.githubPrivate, meta.fetchedAt);
    const row = summarizeProject(payload, now, c.days);
    // Only moving projects are added; the quiet list stays the featured set.
    if (row.state !== "moving") continue;
    rows.push(hide ? conceal(row, ++concealed) : row);
  }

  rows.sort(compareSignalRows);
  const moving = rows.filter((r) => r.state === "moving");
  const shownMoving = moving.slice(0, SIGNAL_MAX_MOVING);
  const shown = [...shownMoving, ...rows.filter((r) => r.state === "quiet")];
  return {
    rows: shown,
    movingCount: moving.length,
    hiddenMovingCount: moving.length - shownMoving.length,
    moreHref: SIGNAL_MORE_HREF,
    totalCount: Math.max(rows.length, meta.totalProjects ?? 0),
    events7: rows.reduce((s, r) => s + r.events7, 0),
    fetchedAt: meta.fetchedAt,
    source: rows.length === 0 ? "empty" : meta.source,
  };
}

export function formatCounts(c: SignalCounts): string {
  const parts: string[] = [];
  if (c.commits) parts.push(c.commits === 1 ? "1 commit" : `${c.commits} commits`);
  if (c.merged) parts.push(`${c.merged} merged`);
  if (c.opened) parts.push(`${c.opened} opened`);
  if (c.releases) parts.push(c.releases === 1 ? "1 release" : `${c.releases} releases`);
  if (c.issues) parts.push(`${c.issues} issue${c.issues === 1 ? "" : "s"}`);
  return parts.join(", ");
}
