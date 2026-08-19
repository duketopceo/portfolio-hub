import type {
  ActivityDayBucket,
  ActivityEventKind,
  ActivityTimelineItem,
  ProjectActivityPayload,
} from "@/lib/github-activity-types";

export const ACTIVITY_RANGE_OPTIONS = [7, 30, 90] as const;
export type ActivityRangeDays = (typeof ACTIVITY_RANGE_OPTIONS)[number];
export const ACTIVITY_DEFAULT_RANGE: ActivityRangeDays = 7;
export const ACTIVITY_HISTORY_DAYS = 90;

export interface ActivityDaySeries {
  date: string;
  /** Short label e.g. "Mon" or "Aug 5" */
  label: string;
  merged: number;
  opened: number;
  reviews: number;
  releases: number;
}

export interface ActivityGroupRow {
  id: string;
  ref: string;
  groupKind: "pr" | "issue" | "release";
  primaryKind: ActivityEventKind;
  label: string;
  at: string;
  url?: string;
  mergeTarget?: string;
  reviewCount: number;
}

export interface CondensedActivity {
  days: ActivityDaySeries[];
  showcase: ActivityGroupRow[];
  grouped: ActivityGroupRow[];
  totals: {
    merged: number;
    opened: number;
    reviews: number;
    releases: number;
    issuesOpened: number;
    issuesClosed: number;
  };
  windowDays: ActivityRangeDays;
}

const SHOWCASE_MAX = 4;
const MS_DAY = 86_400_000;

const KIND_PRIORITY: Partial<Record<ActivityEventKind, number>> = {
  release: 6,
  pr_merged: 5,
  pr_closed: 4,
  issue_closed: 4,
  pr_opened: 3,
  issue_opened: 3,
  review: 1,
};

function groupKey(item: ActivityTimelineItem): string {
  if (!item.ref) return item.id;
  if (item.kind === "release") return `release:${item.ref}`;
  if (item.kind.startsWith("issue")) return `issue:${item.ref}`;
  return `pr:${item.ref}`;
}

function groupKind(item: ActivityTimelineItem): ActivityGroupRow["groupKind"] {
  if (item.kind === "release") return "release";
  if (item.kind.startsWith("issue")) return "issue";
  return "pr";
}

function primaryKind(items: ActivityTimelineItem[]): ActivityEventKind {
  return items.reduce((best, item) => {
    const score = KIND_PRIORITY[item.kind] ?? 0;
    const bestScore = KIND_PRIORITY[best] ?? 0;
    return score > bestScore ? item.kind : best;
  }, items[0].kind);
}

function extractDetail(label: string, fallback: string): string {
  const dash = label.indexOf(" — ");
  if (dash === -1) return fallback;
  return label.slice(dash + 3).trim() || fallback;
}

function buildPrLabel(
  items: ActivityTimelineItem[],
  isPrivate: boolean
): string {
  const ref = items[0].ref ?? "?";
  const reviewCount = items.filter((i) => i.kind === "review").length;
  const merged = items.find((i) => i.kind === "pr_merged");
  const opened = items.find((i) => i.kind === "pr_opened");
  const closed = items.find((i) => i.kind === "pr_closed");

  let status: string;
  let detail = "";

  if (merged) {
    status = "merged";
    if (!isPrivate) detail = extractDetail(merged.label, "");
  } else if (closed) {
    status = "closed";
    if (!isPrivate) detail = extractDetail(closed.label, "");
  } else if (opened) {
    status = "opened";
    if (!isPrivate) detail = extractDetail(opened.label, "");
  } else if (reviewCount > 0) {
    status = "in review";
  } else {
    status = "updated";
  }

  const reviewSuffix =
    reviewCount > 0
      ? ` · ${reviewCount} review${reviewCount !== 1 ? "s" : ""}`
      : "";
  const detailSuffix = detail ? ` — ${detail}` : "";

  return `PR #${ref} — ${status}${reviewSuffix}${detailSuffix}`;
}

function buildIssueLabel(
  items: ActivityTimelineItem[],
  isPrivate: boolean
): string {
  const ref = items[0].ref ?? "?";
  const closed = items.find((i) => i.kind === "issue_closed");
  const opened = items.find((i) => i.kind === "issue_opened");

  if (closed) {
    const detail =
      !isPrivate ? extractDetail(closed.label, "finished") : "finished";
    return `Issue #${ref} — ${detail}`;
  }
  if (opened) {
    const detail =
      !isPrivate ? extractDetail(opened.label, "started") : "started";
    return `Issue #${ref} — ${detail}`;
  }
  return `Issue #${ref}`;
}

function buildGroupRow(
  key: string,
  items: ActivityTimelineItem[],
  isPrivate: boolean
): ActivityGroupRow {
  const sorted = [...items].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
  const kind = groupKind(sorted[0]);
  const primary = primaryKind(sorted);
  const ref = sorted[0].ref ?? key;
  const linkSource =
    sorted.find((i) => i.kind === "pr_merged") ??
    sorted.find((i) => i.kind === "pr_opened") ??
    sorted.find((i) => i.kind === "issue_closed") ??
    sorted.find((i) => i.kind === "issue_opened") ??
    sorted.find((i) => i.kind === "release") ??
    sorted[0];

  let label: string;
  if (kind === "release") {
    label = sorted[0].label;
  } else if (kind === "issue") {
    label = buildIssueLabel(sorted, isPrivate);
  } else {
    label = buildPrLabel(sorted, isPrivate);
  }

  return {
    id: key,
    ref,
    groupKind: kind,
    primaryKind: primary,
    label,
    at: sorted[0].at,
    url: linkSource.url,
    mergeTarget: linkSource.mergeTarget,
    reviewCount: sorted.filter((i) => i.kind === "review").length,
  };
}

function isShowcaseRow(row: ActivityGroupRow): boolean {
  return row.primaryKind === "pr_merged" || row.primaryKind === "release";
}

function rowSortKey(row: ActivityGroupRow): number {
  const priority = KIND_PRIORITY[row.primaryKind] ?? 0;
  return priority * 1e12 + new Date(row.at).getTime();
}

function sinceDateKey(anchorDate: Date, windowDays: number): string {
  const d = new Date(anchorDate);
  d.setUTCDate(d.getUTCDate() - (windowDays - 1));
  return d.toISOString().slice(0, 10);
}

function inWindow(iso: string, sinceMs: number): boolean {
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && t >= sinceMs;
}

/** Slice fetched history to the visible range before aggregation. */
export function filterActivityByWindow(
  payload: ProjectActivityPayload,
  windowDays: ActivityRangeDays,
  anchorDate = new Date(payload.fetchedAt)
): ProjectActivityPayload {
  const sinceMs = anchorDate.getTime() - windowDays * MS_DAY;
  const sinceDate = sinceDateKey(anchorDate, windowDays);

  return {
    ...payload,
    items: payload.items.filter((item) => inWindow(item.at, sinceMs)),
    days: payload.days.filter((day) => day.date >= sinceDate),
  };
}

function buildDailySeries(
  buckets: ActivityDayBucket[],
  anchorDate: Date,
  windowDays: number
): ActivityDaySeries[] {
  const byDate = new Map(buckets.map((b) => [b.date, b]));
  const series: ActivityDaySeries[] = [];

  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(anchorDate);
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    const bucket = byDate.get(date);
    series.push({
      date,
      label: d.toLocaleDateString("en-US", {
        weekday: windowDays <= 14 ? "short" : undefined,
        month: windowDays > 14 ? "short" : undefined,
        day: windowDays > 14 ? "numeric" : undefined,
        timeZone: "UTC",
      }),
      merged: bucket?.prsMerged ?? 0,
      opened: bucket?.prsOpened ?? 0,
      reviews: bucket?.reviews ?? 0,
      releases: bucket?.releases ?? 0,
    });
  }

  return series;
}

function weekStartKey(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function buildWeeklySeries(
  buckets: ActivityDayBucket[],
  anchorDate: Date,
  windowDays: number
): ActivityDaySeries[] {
  const weekMap = new Map<
    string,
    { merged: number; opened: number; reviews: number; releases: number }
  >();

  for (const bucket of buckets) {
    const key = weekStartKey(new Date(`${bucket.date}T12:00:00.000Z`));
    const entry = weekMap.get(key) ?? {
      merged: 0,
      opened: 0,
      reviews: 0,
      releases: 0,
    };
    entry.merged += bucket.prsMerged;
    entry.opened += bucket.prsOpened;
    entry.reviews += bucket.reviews;
    entry.releases += bucket.releases;
    weekMap.set(key, entry);
  }

  const weeks = Math.ceil(windowDays / 7);
  const series: ActivityDaySeries[] = [];
  const anchorWeek = weekStartKey(anchorDate);

  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(`${anchorWeek}T12:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const date = d.toISOString().slice(0, 10);
    const bucket = weekMap.get(date);
    series.push({
      date,
      label: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      merged: bucket?.merged ?? 0,
      opened: bucket?.opened ?? 0,
      reviews: bucket?.reviews ?? 0,
      releases: bucket?.releases ?? 0,
    });
  }

  return series;
}

export function buildDaySeries(
  buckets: ActivityDayBucket[],
  anchorDate = new Date(),
  windowDays: ActivityRangeDays = ACTIVITY_DEFAULT_RANGE
): ActivityDaySeries[] {
  if (windowDays > 30) {
    return buildWeeklySeries(buckets, anchorDate, windowDays);
  }
  return buildDailySeries(buckets, anchorDate, windowDays);
}

export function condenseProjectActivity(
  payload: ProjectActivityPayload,
  options?: { anchorDate?: Date; windowDays?: ActivityRangeDays }
): CondensedActivity {
  const anchorDate = options?.anchorDate ?? new Date(payload.fetchedAt);
  const windowDays = options?.windowDays ?? ACTIVITY_DEFAULT_RANGE;
  const scoped = filterActivityByWindow(payload, windowDays, anchorDate);

  const groups = new Map<string, ActivityTimelineItem[]>();

  for (const item of scoped.items) {
    const key = groupKey(item);
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  const rows = [...groups.entries()].map(([key, items]) =>
    buildGroupRow(key, items, scoped.private)
  );

  rows.sort((a, b) => rowSortKey(b) - rowSortKey(a));

  const showcase = rows
    .filter(isShowcaseRow)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, SHOWCASE_MAX);
  const showcaseIds = new Set(showcase.map((r) => r.id));
  const grouped = rows.filter((r) => !showcaseIds.has(r.id));

  const totals = scoped.days.reduce(
    (acc, day) => ({
      merged: acc.merged + day.prsMerged,
      opened: acc.opened + day.prsOpened,
      reviews: acc.reviews + day.reviews,
      releases: acc.releases + day.releases,
      issuesOpened: acc.issuesOpened + day.issuesOpened,
      issuesClosed: acc.issuesClosed + day.issuesClosed,
    }),
    {
      merged: 0,
      opened: 0,
      reviews: 0,
      releases: 0,
      issuesOpened: 0,
      issuesClosed: 0,
    }
  );

  return {
    days: buildDaySeries(scoped.days, anchorDate, windowDays),
    showcase,
    grouped,
    totals,
    windowDays,
  };
}

export function formatTotalsLine(
  totals: CondensedActivity["totals"],
  windowDays: ActivityRangeDays = ACTIVITY_DEFAULT_RANGE
): string {
  const parts: string[] = [];
  if (totals.merged > 0) {
    parts.push(`${totals.merged} merged`);
  }
  if (totals.opened > 0) {
    parts.push(`${totals.opened} opened`);
  }
  if (totals.reviews > 0) {
    parts.push(`${totals.reviews} reviews`);
  }
  if (totals.releases > 0) {
    parts.push(
      totals.releases === 1 ? "1 release" : `${totals.releases} releases`
    );
  }
  if (totals.issuesOpened > 0) {
    parts.push(`${totals.issuesOpened} started`);
  }
  if (totals.issuesClosed > 0) {
    parts.push(`${totals.issuesClosed} finished`);
  }
  if (parts.length > 0) return parts.join(" · ");
  return windowDays === 7 ? "Quiet week" : `Quiet ${windowDays}d`;
}

export function showcaseKindLabel(kind: ActivityEventKind): string {
  switch (kind) {
    case "pr_merged":
      return "Merged";
    case "release":
      return "Release";
    case "pr_opened":
      return "Opened";
    case "pr_closed":
      return "Closed";
    case "review":
      return "Review";
    case "issue_opened":
      return "Started";
    case "issue_closed":
      return "Finished";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function activityRangeLabel(days: ActivityRangeDays): string {
  return `Last ${days} days`;
}
