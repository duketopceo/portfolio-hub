import type {
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
const MS_DAY = 86_400_000;

/** 0 = quiet, 4 = busiest. Never conveyed by color alone (bar height + count). */
export type SignalLevel = 0 | 1 | 2 | 3 | 4;

export interface SignalCounts {
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
  lastKind: ActivityEventKind | null;
  lastAt: string | null;
  /** One line. Private repos get a generic kind line, never a title. */
  lastLine: string | null;
  /** Whole days since the latest event (0 = today), or null. */
  lastAgeDays: number | null;
}

export interface SignalSummary {
  rows: SignalRow[];
  movingCount: number;
  totalCount: number;
  events7: number;
  fetchedAt: string;
  source: "github" | "fixture" | "empty";
}

const KIND_NOUN: Record<ActivityEventKind, string> = {
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
  now: Date
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

  const counts7: SignalCounts = { merged: 0, opened: 0, releases: 0, issues: 0 };
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

  const max = Math.max(0, ...dates.map((d) => perDay.get(d) ?? 0));
  const heat = dates.map((date) => {
    const count = perDay.get(date) ?? 0;
    return { date, count, level: levelFor(count, max) };
  });
  const events7 = heat.reduce((s, h) => s + h.count, 0);

  const last = latestItem(payload.items, now);
  const lastAgeDays = last ? Math.max(0, dayDiff(now, new Date(last.at))) : null;

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
    lastKind: last?.kind ?? null,
    lastAt: last?.at ?? null,
    lastLine: last ? lineFor(last, payload.private) : null,
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

export function buildSignalSummary(
  payloads: ProjectActivityPayload[],
  meta: { fetchedAt: string; source: SignalSummary["source"] }
): SignalSummary {
  const parsed = new Date(meta.fetchedAt);
  const now = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const rows = payloads.map((p) => summarizeProject(p, now)).sort(compareSignalRows);
  return {
    rows,
    movingCount: rows.filter((r) => r.state === "moving").length,
    totalCount: rows.length,
    events7: rows.reduce((s, r) => s + r.events7, 0),
    fetchedAt: meta.fetchedAt,
    source: rows.length === 0 ? "empty" : meta.source,
  };
}

export function formatCounts(c: SignalCounts): string {
  const parts: string[] = [];
  if (c.merged) parts.push(`${c.merged} merged`);
  if (c.opened) parts.push(`${c.opened} opened`);
  if (c.releases) parts.push(c.releases === 1 ? "1 release" : `${c.releases} releases`);
  if (c.issues) parts.push(`${c.issues} issue${c.issues === 1 ? "" : "s"}`);
  return parts.join(", ");
}
