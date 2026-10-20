import { scrubActivityText } from "@/lib/activity-scrubber";
import { ACTIVITY_REVALIDATE_SECONDS } from "@/lib/github-activity";
import { getGithubAccessToken } from "@/lib/github-app";
import { GITHUB_ACCOUNT_LOGIN, GITHUB_API_BASE } from "@/lib/github-constants";
import { classifyHttpStatus, logGithubFailure } from "@/lib/github-errors";
import { isAllowlistedRepo } from "@/data/upstream-allowlist";
import {
  fixtureSearchItems,
  type GhSearchPrItem,
} from "@/lib/upstream-fixtures";

export interface UpstreamPr {
  repo: string;
  number: number;
  title: string;
  url: string;
  /** ISO date: merged_at, closed_at, or created_at by state. */
  date: string;
}

export interface UpstreamContributionsData {
  merged: UpstreamPr[];
  open: UpstreamPr[];
  closed: UpstreamPr[];
  fetchedAt: string;
}

const PER_PAGE = 100;
const MAX_PAGES = 5;

export const UPSTREAM_QUERY = `author:${GITHUB_ACCOUNT_LOGIN} is:pr is:public -user:${GITHUB_ACCOUNT_LOGIN}`;

async function searchPage(
  token: string,
  page: number
): Promise<GhSearchPrItem[] | null> {
  const params = new URLSearchParams({
    q: UPSTREAM_QUERY,
    sort: "updated",
    per_page: String(PER_PAGE),
    page: String(page),
  });
  try {
    const res = await fetch(`${GITHUB_API_BASE}/search/issues?${params}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "portfolio-hub",
      },
      next: { revalidate: ACTIVITY_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(18_000),
    });
    if (!res.ok) {
      logGithubFailure("upstream search", {
        kind: classifyHttpStatus(res.status),
        status: res.status,
        message: "Search request failed",
      });
      return null;
    }
    const body = (await res.json()) as { items?: GhSearchPrItem[] };
    return Array.isArray(body.items) ? body.items : null;
  } catch {
    logGithubFailure("upstream search", {
      kind: "network",
      message: "Search request errored",
    });
    return null;
  }
}

async function fetchAllItems(): Promise<GhSearchPrItem[] | null> {
  if (process.env.ACTIVITY_USE_FIXTURES === "1") {
    return fixtureSearchItems().filter((i) => i.fixtureVisibility !== "private");
  }
  const token = await getGithubAccessToken();
  if (!token) return null;
  const all: GhSearchPrItem[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const items = await searchPage(token, page);
    if (!items) return null;
    all.push(...items);
    if (items.length < PER_PAGE) break;
  }
  return all;
}

function repoOf(item: GhSearchPrItem): string {
  return item.repository_url.replace(/^.*\/repos\//, "");
}

function byDateDesc(a: UpstreamPr, b: UpstreamPr): number {
  return b.date.localeCompare(a.date);
}

/** Merged / open / closed-without-merge PRs to other people's public repos, or
 * null when GitHub cannot be reached (callers show an explicit unavailable
 * state, never zero counts). */
export async function getUpstreamContributions(): Promise<UpstreamContributionsData | null> {
  const items = await fetchAllItems();
  if (!items) return null;

  const data: UpstreamContributionsData = {
    merged: [],
    open: [],
    closed: [],
    fetchedAt: new Date().toISOString(),
  };

  for (const item of items) {
    const repo = repoOf(item);
    if (!isAllowlistedRepo(repo)) {
      console.error(`[upstream] dropped non-allowlisted repo ${repo}`);
      continue;
    }
    const merged = item.pull_request?.merged_at ?? null;
    const pr: UpstreamPr = {
      repo,
      number: item.number,
      title: scrubActivityText(item.title, true, `PR #${item.number}`),
      url: item.html_url,
      date:
        item.state === "open"
          ? item.created_at
          : (merged ?? item.closed_at ?? item.created_at),
    };
    if (item.state === "open") data.open.push(pr);
    else if (merged) data.merged.push(pr);
    else data.closed.push(pr);
  }

  data.merged.sort(byDateDesc);
  data.open.sort(byDateDesc);
  data.closed.sort(byDateDesc);
  return data;
}
