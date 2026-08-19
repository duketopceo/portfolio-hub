import { projectConfigs } from "@/data/projects";
import { HOMEPAGE_FEATURED_SLUGS } from "@/lib/project-completeness";
import { scrubActivityText, scrubBranchRef } from "@/lib/activity-scrubber";
import {
  condenseProjectActivity,
  formatTotalsLine,
} from "@/lib/activity-aggregate";
import {
  fixtureHomepageActivity,
  fixtureProjectActivity,
} from "@/lib/github-activity-fixtures";
import type {
  ActivityDayBucket,
  ActivityEventKind,
  ActivityTimelineItem,
  HomepageActivityLine,
  HomepageActivityPayload,
  HomepageRepoActivity,
  ProjectActivityPayload,
} from "@/lib/github-activity-types";
import { getGithubAccessToken } from "@/lib/github-app";
import { GITHUB_ACCOUNT_LOGIN, GITHUB_API_BASE } from "@/lib/github-constants";

export const ACTIVITY_REVALIDATE_SECONDS = 3600;
const WINDOW_MS = 7 * 86_400_000;
const HOMEPAGE_MAX_LINES = 4;

interface RepoTarget {
  slug: string;
  displayName: string;
  repoName: string;
  private: boolean;
}

interface GhPull {
  number: number;
  title: string;
  html_url: string;
  state: string;
  merged_at: string | null;
  created_at: string;
  closed_at: string | null;
  updated_at: string;
  base: { ref: string };
}

interface GhRelease {
  id: number;
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
}

interface GhReview {
  id: number;
  submitted_at: string | null;
  state: string;
}

interface GhIssue {
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  closed_at: string | null;
  pull_request?: unknown;
}

function featuredRepoTargets(): RepoTarget[] {
  const targets: RepoTarget[] = [];
  for (const slug of HOMEPAGE_FEATURED_SLUGS) {
    const cfg = projectConfigs.find((p) => p.slug === slug);
    if (!cfg || !cfg.repoName) continue;
    targets.push({
      slug,
      displayName: cfg.displayName,
      repoName: cfg.repoName,
      private: cfg.private,
    });
  }
  return targets;
}

function repoTargetForSlug(slug: string): RepoTarget | null {
  const cfg = projectConfigs.find((p) => p.slug === slug);
  if (!cfg || !cfg.repoName) return null;
  return {
    slug,
    displayName: cfg.displayName,
    repoName: cfg.repoName,
    private: cfg.private,
  };
}

async function ghGet<T>(path: string): Promise<T | null> {
  const token = await getGithubAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${GITHUB_API_BASE}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "portfolio-hub",
      },
      next: { revalidate: ACTIVITY_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function inWindow(iso: string, sinceMs: number): boolean {
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && t >= sinceMs;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function publicUrl(
  isPrivate: boolean,
  htmlUrl: string,
  slug: string
): string | undefined {
  if (isPrivate) return undefined;
  return htmlUrl;
}

async function fetchPulls(repoName: string): Promise<GhPull[]> {
  const open =
    (await ghGet<GhPull[]>(
      `/repos/${GITHUB_ACCOUNT_LOGIN}/${encodeURIComponent(repoName)}/pulls?state=open&sort=updated&direction=desc&per_page=20`
    )) ?? [];
  const closed =
    (await ghGet<GhPull[]>(
      `/repos/${GITHUB_ACCOUNT_LOGIN}/${encodeURIComponent(repoName)}/pulls?state=closed&sort=updated&direction=desc&per_page=30`
    )) ?? [];
  const seen = new Set<number>();
  return [...open, ...closed].filter((p) => {
    if (seen.has(p.number)) return false;
    seen.add(p.number);
    return true;
  });
}

async function fetchReleases(repoName: string): Promise<GhRelease[]> {
  return (
    (await ghGet<GhRelease[]>(
      `/repos/${GITHUB_ACCOUNT_LOGIN}/${encodeURIComponent(repoName)}/releases?per_page=15`
    )) ?? []
  );
}

async function fetchIssues(repoName: string, sinceIso: string): Promise<GhIssue[]> {
  const raw =
    (await ghGet<GhIssue[]>(
      `/repos/${GITHUB_ACCOUNT_LOGIN}/${encodeURIComponent(repoName)}/issues?state=all&since=${encodeURIComponent(sinceIso)}&sort=updated&direction=desc&per_page=30`
    )) ?? [];
  return raw.filter((i) => !i.pull_request);
}

async function fetchReviews(
  repoName: string,
  pullNumber: number
): Promise<GhReview[]> {
  return (
    (await ghGet<GhReview[]>(
      `/repos/${GITHUB_ACCOUNT_LOGIN}/${encodeURIComponent(repoName)}/pulls/${pullNumber}/reviews`
    )) ?? []
  );
}

function emptyDay(date: string): ActivityDayBucket {
  return {
    date,
    prsOpened: 0,
    prsMerged: 0,
    reviews: 0,
    releases: 0,
    issuesOpened: 0,
    issuesClosed: 0,
    items: [],
  };
}

function bumpDay(
  map: Map<string, ActivityDayBucket>,
  date: string
): ActivityDayBucket {
  let b = map.get(date);
  if (!b) {
    b = emptyDay(date);
    map.set(date, b);
  }
  return b;
}

function reviewStateLabel(state: string): string {
  switch (state) {
    case "APPROVED":
      return "approved";
    case "CHANGES_REQUESTED":
      return "changes requested";
    case "COMMENTED":
      return "commented";
    default:
      return "reviewed";
  }
}

async function buildRepoActivity(
  target: RepoTarget,
  sinceMs: number
): Promise<ProjectActivityPayload | null> {
  const sinceIso = new Date(sinceMs).toISOString();
  const [pulls, releases, issues] = await Promise.all([
    fetchPulls(target.repoName),
    fetchReleases(target.repoName),
    fetchIssues(target.repoName, sinceIso),
  ]);

  if (
    !pulls.length &&
    !releases.length &&
    !issues.length &&
    !(await getGithubAccessToken())
  ) {
    return null;
  }

  const items: ActivityTimelineItem[] = [];
  const dayMap = new Map<string, ActivityDayBucket>();

  let weekMerged = 0;
  let weekOpened = 0;
  let weekReviews = 0;
  let weekReleases = 0;
  let weekIssuesOpened = 0;
  let weekIssuesClosed = 0;

  const reviewFetchTargets = pulls.filter((pr) => {
    const openedInWindow = inWindow(pr.created_at, sinceMs);
    const mergedInWindow = pr.merged_at && inWindow(pr.merged_at, sinceMs);
    const closedInWindow =
      pr.closed_at && inWindow(pr.closed_at, sinceMs) && !pr.merged_at;
    const updatedInWindow = inWindow(pr.updated_at, sinceMs);
    return openedInWindow || mergedInWindow || closedInWindow || updatedInWindow;
  });

  const reviewResults = await Promise.all(
    reviewFetchTargets.slice(0, 15).map(async (pr) => ({
      number: pr.number,
      reviews: await fetchReviews(target.repoName, pr.number),
    }))
  );

  const reviewsByPr = new Map(
    reviewResults.map((r) => [r.number, r.reviews] as const)
  );

  for (const pr of pulls) {
    const mergedInWindow = pr.merged_at && inWindow(pr.merged_at, sinceMs);
    const openedInWindow = inWindow(pr.created_at, sinceMs);
    const closedInWindow =
      pr.closed_at && inWindow(pr.closed_at, sinceMs) && !pr.merged_at;

    if (!mergedInWindow && !openedInWindow && !closedInWindow) continue;

    if (openedInWindow) {
      weekOpened++;
      const dk = dayKey(pr.created_at);
      const bucket = bumpDay(dayMap, dk);
      bucket.prsOpened++;
      const fallback = `PR #${pr.number} opened`;
      const title = scrubActivityText(pr.title, target.private, fallback);
      items.push({
        id: `${target.slug}-pr-open-${pr.number}`,
        kind: "pr_opened",
        at: pr.created_at,
        label: target.private
          ? `PR #${pr.number} opened${title !== fallback ? ` — ${title}` : ""}`
          : `PR #${pr.number} opened — ${title}`,
        ref: String(pr.number),
        url: publicUrl(target.private, pr.html_url, target.slug),
        mergeTarget: scrubBranchRef(pr.base.ref, target.private),
      });
    }

    if (mergedInWindow) {
      weekMerged++;
      const dk = dayKey(pr.merged_at!);
      const bucket = bumpDay(dayMap, dk);
      bucket.prsMerged++;
      const fallback = "PR merged";
      const title = scrubActivityText(pr.title, target.private, fallback);
      items.push({
        id: `${target.slug}-pr-merge-${pr.number}`,
        kind: "pr_merged",
        at: pr.merged_at!,
        label: target.private
          ? `PR #${pr.number} merged`
          : `PR #${pr.number} merged — ${title}`,
        ref: String(pr.number),
        url: publicUrl(target.private, pr.html_url, target.slug),
        mergeTarget: scrubBranchRef(pr.base.ref, target.private),
      });
    }

    if (closedInWindow) {
      const dk = dayKey(pr.closed_at!);
      const bucket = bumpDay(dayMap, dk);
      const fallback = "PR closed";
      const title = scrubActivityText(pr.title, target.private, fallback);
      items.push({
        id: `${target.slug}-pr-close-${pr.number}`,
        kind: "pr_closed",
        at: pr.closed_at!,
        label: target.private
          ? `PR #${pr.number} closed`
          : `PR #${pr.number} closed — ${title}`,
        ref: String(pr.number),
        url: publicUrl(target.private, pr.html_url, target.slug),
      });
    }

    const prReviews = reviewsByPr.get(pr.number) ?? [];
    for (const review of prReviews) {
      if (!review.submitted_at || !inWindow(review.submitted_at, sinceMs))
        continue;
      if (
        review.state !== "APPROVED" &&
        review.state !== "COMMENTED" &&
        review.state !== "CHANGES_REQUESTED"
      ) {
        continue;
      }
      weekReviews++;
      const dk = dayKey(review.submitted_at);
      const bucket = bumpDay(dayMap, dk);
      bucket.reviews++;
      const verb = reviewStateLabel(review.state);
      items.push({
        id: `${target.slug}-review-${review.id}`,
        kind: "review",
        at: review.submitted_at,
        label: target.private
          ? `Review on PR #${pr.number} (${verb})`
          : `PR #${pr.number} ${verb}`,
        ref: String(pr.number),
        url: publicUrl(target.private, pr.html_url, target.slug),
      });
    }
  }

  for (const issue of issues) {
    const openedInWindow = inWindow(issue.created_at, sinceMs);
    const closedInWindow =
      issue.closed_at && inWindow(issue.closed_at, sinceMs);

    if (openedInWindow) {
      weekIssuesOpened++;
      const dk = dayKey(issue.created_at);
      const bucket = bumpDay(dayMap, dk);
      bucket.issuesOpened++;
      const fallback = `Issue #${issue.number} started`;
      const title = scrubActivityText(issue.title, target.private, fallback);
      items.push({
        id: `${target.slug}-issue-open-${issue.number}`,
        kind: "issue_opened",
        at: issue.created_at,
        label: target.private
          ? `Issue #${issue.number} started`
          : `Issue #${issue.number} started — ${title}`,
        ref: String(issue.number),
        url: publicUrl(target.private, issue.html_url, target.slug),
      });
    }

    if (closedInWindow) {
      weekIssuesClosed++;
      const dk = dayKey(issue.closed_at!);
      const bucket = bumpDay(dayMap, dk);
      bucket.issuesClosed++;
      const fallback = `Issue #${issue.number} finished`;
      const title = scrubActivityText(issue.title, target.private, fallback);
      items.push({
        id: `${target.slug}-issue-close-${issue.number}`,
        kind: "issue_closed",
        at: issue.closed_at!,
        label: target.private
          ? `Issue #${issue.number} finished`
          : `Issue #${issue.number} finished — ${title}`,
        ref: String(issue.number),
        url: publicUrl(target.private, issue.html_url, target.slug),
      });
    }
  }

  for (const rel of releases) {
    if (!rel.published_at || !inWindow(rel.published_at, sinceMs)) continue;
    weekReleases++;
    const dk = dayKey(rel.published_at);
    const bucket = bumpDay(dayMap, dk);
    bucket.releases++;
    const tag = rel.tag_name || rel.name || "release";
    const fallback = "Release published";
    const name = scrubActivityText(rel.name || tag, target.private, fallback);
    items.push({
      id: `${target.slug}-rel-${rel.id}`,
      kind: "release",
      at: rel.published_at,
      label: target.private
        ? `Release ${tag}`
        : `Release ${tag} — ${name}`,
      ref: tag,
      url: publicUrl(target.private, rel.html_url, target.slug),
    });
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const headline = buildHeadline(
    weekMerged,
    weekOpened,
    weekReviews,
    weekReleases,
    weekIssuesOpened,
    weekIssuesClosed,
    items
  );

  const days = [...dayMap.values()].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return {
    slug: target.slug,
    displayName: target.displayName,
    private: target.private,
    headline,
    items,
    days,
    fetchedAt: new Date().toISOString(),
    source: "github",
  };
}

function buildHeadline(
  merged: number,
  opened: number,
  reviews: number,
  releases: number,
  issuesOpened: number,
  issuesClosed: number,
  items: ActivityTimelineItem[]
): string {
  const parts: string[] = [];
  if (merged > 0) {
    const latestMerge = items.find((i) => i.kind === "pr_merged");
    if (latestMerge) {
      parts.push(
        `${merged} PR${merged !== 1 ? "s" : ""} merged ${formatShortDate(latestMerge.at)}`
      );
    } else {
      parts.push(`${merged} PR${merged !== 1 ? "s" : ""} merged this week`);
    }
  } else if (opened > 0) {
    const latest = items.find((i) => i.kind === "pr_opened");
    if (latest?.ref) {
      parts.push(`PR #${latest.ref} opened`);
    } else {
      parts.push(`${opened} PR${opened !== 1 ? "s" : ""} opened`);
    }
  }
  if (reviews > 0) {
    parts.push(`${reviews} review${reviews !== 1 ? "s" : ""}`);
  }
  if (releases > 0) {
    parts.push(releases === 1 ? "release cut" : `${releases} releases`);
  }
  if (issuesOpened > 0) {
    parts.push(`${issuesOpened} started`);
  }
  if (issuesClosed > 0) {
    parts.push(`${issuesClosed} finished`);
  }
  if (parts.length === 0) return "Quiet week — curated dossier below";
  return parts.join(" · ");
}

function buildHomepageRepos(
  summaries: ProjectActivityPayload[]
): HomepageRepoActivity[] {
  const sorted = [...summaries].sort((a, b) => b.items.length - a.items.length);

  return sorted.slice(0, HOMEPAGE_MAX_LINES).map((summary) => {
    const condensed = condenseProjectActivity(summary, {
      anchorDate: new Date(summary.fetchedAt),
    });
    return {
      slug: summary.slug,
      displayName: summary.displayName,
      private: summary.private,
      href: `/projects/${summary.slug}`,
      headline: summary.headline,
      condensed,
    };
  });
}

function buildHomepageDigest(
  summaries: ProjectActivityPayload[]
): HomepageActivityLine[] {
  return buildHomepageRepos(summaries).map((repo) => ({
    slug: repo.slug,
    displayName: repo.displayName,
    private: repo.private,
    line: formatTotalsLine(repo.condensed.totals) || repo.headline,
    href: repo.href,
  }));
}

export async function getProjectActivityTimeline(
  slug: string,
  options?: { useFixtures?: boolean }
): Promise<ProjectActivityPayload> {
  if (options?.useFixtures || process.env.ACTIVITY_USE_FIXTURES === "1") {
    return fixtureProjectActivity(slug);
  }

  const target = repoTargetForSlug(slug);
  if (!target) {
    return {
      slug,
      displayName: slug,
      private: false,
      headline: "No GitHub repository linked",
      items: [],
      days: [],
      fetchedAt: new Date().toISOString(),
      source: "empty",
    };
  }

  const sinceMs = Date.now() - WINDOW_MS;
  const activity = await buildRepoActivity(target, sinceMs);
  if (activity) return activity;

  if (process.env.NODE_ENV === "test") {
    return fixtureProjectActivity(slug);
  }

  return {
    slug: target.slug,
    displayName: target.displayName,
    private: target.private,
    headline: "GitHub activity unavailable — curated dossier below",
    items: [],
    days: [],
    fetchedAt: new Date().toISOString(),
    source: "empty",
  };
}

export async function getHomepageActivityShowcase(options?: {
  useFixtures?: boolean;
}): Promise<HomepageActivityPayload> {
  if (options?.useFixtures || process.env.ACTIVITY_USE_FIXTURES === "1") {
    return fixtureHomepageActivity();
  }

  const sinceMs = Date.now() - WINDOW_MS;
  const targets = featuredRepoTargets();
  const summaries: ProjectActivityPayload[] = [];

  for (const target of targets) {
    const activity = await buildRepoActivity(target, sinceMs);
    if (activity && activity.items.length > 0) {
      summaries.push(activity);
    }
  }

  if (summaries.length === 0) {
    const token = await getGithubAccessToken();
    if (!token) {
      if (process.env.NODE_ENV === "test") {
        return fixtureHomepageActivity();
      }
      return {
        lines: [],
        repos: [],
        fetchedAt: new Date().toISOString(),
        source: "empty",
      };
    }
    return {
      lines: [],
      repos: [],
      fetchedAt: new Date().toISOString(),
      source: "empty",
    };
  }

  const repos = buildHomepageRepos(summaries);
  const lines = buildHomepageDigest(summaries);

  return {
    lines,
    repos,
    fetchedAt: new Date().toISOString(),
    source: "github",
  };
}

/** Map event kind to human verb for fail-closed fallback */
export function activityKindFallback(kind: ActivityEventKind): string {
  switch (kind) {
    case "pr_opened":
      return "PR opened";
    case "pr_merged":
      return "PR merged";
    case "pr_closed":
      return "PR closed";
    case "review":
      return "Review submitted";
    case "release":
      return "Release published";
    case "issue_opened":
      return "Work started";
    case "issue_closed":
      return "Work finished";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** Human verb for timeline badges */
export function activityKindVerb(kind: ActivityEventKind): string {
  switch (kind) {
    case "pr_opened":
      return "Opened";
    case "pr_merged":
      return "Merged";
    case "pr_closed":
      return "Closed";
    case "review":
      return "Reviewed";
    case "release":
      return "Released";
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
