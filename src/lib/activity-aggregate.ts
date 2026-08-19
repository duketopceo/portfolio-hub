import type {
  ActivityDayBucket,
  ActivityEventKind,
  ActivityTimelineItem,
  ProjectActivityPayload,
} from "@/lib/github-activity-types";

export interface ActivityDaySeries {
  date: string;
  /** Short label e.g. "Mon" */
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
}

const SHOWCASE_MAX = 4;
const WINDOW_DAYS = 7;

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

export function buildDaySeries(
  buckets: ActivityDayBucket[],
  anchorDate = new Date()
): ActivityDaySeries[] {
  const byDate = new Map(buckets.map((b) => [b.date, b]));
  const series: ActivityDaySeries[] = [];

  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(anchorDate);
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    const bucket = byDate.get(date);
    series.push({
      date,
      label: d.toLocaleDateString("en-US", {
        weekday: "short",
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

export function condenseProjectActivity(
  payload: ProjectActivityPayload,
  options?: { anchorDate?: Date }
): CondensedActivity {
  const groups = new Map<string, ActivityTimelineItem[]>();

  for (const item of payload.items) {
    const key = groupKey(item);
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  const rows = [...groups.entries()].map(([key, items]) =>
    buildGroupRow(key, items, payload.private)
  );

  rows.sort((a, b) => rowSortKey(b) - rowSortKey(a));

  const showcase = rows
    .filter(isShowcaseRow)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, SHOWCASE_MAX);
  const showcaseIds = new Set(showcase.map((r) => r.id));
  const grouped = rows.filter((r) => !showcaseIds.has(r.id));

  const totals = payload.days.reduce(
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
    days: buildDaySeries(payload.days, options?.anchorDate),
    showcase,
    grouped,
    totals,
  };
}

export function formatTotalsLine(totals: CondensedActivity["totals"]): string {
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
  return parts.length > 0 ? parts.join(" · ") : "Quiet week";
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
