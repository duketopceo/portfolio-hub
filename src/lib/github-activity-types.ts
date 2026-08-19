/** Safe for client — no tokens, raw commit bodies, or private deep-links unless public */

export type ActivityEventKind =
  | "pr_opened"
  | "pr_merged"
  | "pr_closed"
  | "review"
  | "release"
  | "issue_opened"
  | "issue_closed";

export interface ActivityTimelineItem {
  id: string;
  kind: ActivityEventKind;
  /** ISO timestamp */
  at: string;
  /** Display line (pre-scrubbed server-side) */
  label: string;
  /** PR #, release tag, etc. */
  ref?: string;
  /** Public repos: link to GitHub. Private: omitted or dossier-only */
  url?: string;
  mergeTarget?: string;
}

export interface ActivityDayBucket {
  date: string;
  prsOpened: number;
  prsMerged: number;
  reviews: number;
  releases: number;
  issuesOpened: number;
  issuesClosed: number;
  items: ActivityTimelineItem[];
}

export interface ProjectActivityPayload {
  slug: string;
  displayName: string;
  private: boolean;
  /** Homepage one-liner when aggregating */
  headline: string;
  days: ActivityDayBucket[];
  items: ActivityTimelineItem[];
  fetchedAt: string;
  source: "github" | "fixture" | "empty";
}

export interface HomepageActivityLine {
  slug: string;
  displayName: string;
  private: boolean;
  line: string;
  href: string;
}

export interface HomepageActivityPayload {
  lines: HomepageActivityLine[];
  fetchedAt: string;
  source: "github" | "fixture" | "empty";
}
