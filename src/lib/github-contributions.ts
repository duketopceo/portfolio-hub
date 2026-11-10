import { listedProjects } from "@/lib/catalog";
import type { ProjectConfig } from "@/lib/types";
import type {
  ContributionDay,
  SignalContribution,
} from "@/lib/signal-summary";
import { getGithubAccessToken } from "@/lib/github-app";
import {
  GITHUB_ACCOUNT_LOGIN,
  GITHUB_API_BASE,
  resolveRepoOwner,
} from "@/lib/github-constants";

/**
 * The single account-wide GitHub GraphQL call behind the home signal. It
 * returns commit, opened-PR and opened-issue counts per repository and day,
 * never titles or messages. Server-only; feeds the signal summary and nothing
 * else (never /api/activity).
 */

export interface ContributionRepo {
  owner: string;
  name: string;
  isPrivate: boolean;
  days: ContributionDay[];
}

const QUERY = `query SignalContributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      commitContributionsByRepository(maxRepositories: 100) {
        repository { name isPrivate owner { login } }
        contributions(first: 100, orderBy: { field: OCCURRED_AT, direction: DESC }) { nodes { occurredAt commitCount } }
      }
      pullRequestContributionsByRepository(maxRepositories: 100) {
        repository { name isPrivate owner { login } }
        contributions(first: 100, orderBy: { direction: DESC }) { nodes { occurredAt } }
      }
      issueContributionsByRepository(maxRepositories: 100) {
        repository { name isPrivate owner { login } }
        contributions(first: 100, orderBy: { direction: DESC }) { nodes { occurredAt } }
      }
    }
  }
}`;

type RawRepo = {
  repository?: {
    name?: string;
    isPrivate?: boolean;
    owner?: { login?: string };
  };
  contributions?: { nodes?: Array<{ occurredAt?: string; commitCount?: number }> };
};

type RawResponse = {
  errors?: Array<{ type?: string }>;
  data?: {
    user?: {
      contributionsCollection?: {
        commitContributionsByRepository?: RawRepo[];
        pullRequestContributionsByRepository?: RawRepo[];
        issueContributionsByRepository?: RawRepo[];
      };
    } | null;
  };
};

function repoKey(owner: string, name: string): string {
  return `${owner}/${name}`.toLowerCase();
}

const MS_HOUR = 3_600_000;

/**
 * Commit contribution `occurredAt` is the start of the contributor's LOCAL
 * calendar day (a real instant, e.g. 22:00Z for UTC+2), not a UTC timestamp.
 * Slicing it as UTC would shift those commits a day early for zones east of
 * UTC. Adding 12h before slicing yields the nearest UTC midnight, i.e. the
 * local calendar date for any offset within +-12h. The signal keys every day
 * by calendar date, so commit days are calendar dates and PR/issue days (true
 * instants) are plain UTC dates.
 */
export function commitContributionDay(occurredAt: string): string {
  return new Date(Date.parse(occurredAt) + 12 * MS_HOUR).toISOString().slice(0, 10);
}

/** Pure: fold the three GraphQL lists into per-repo, per-day counts. */
export function parseContributionResponse(raw: RawResponse): ContributionRepo[] | null {
  const c = raw.data?.user?.contributionsCollection;
  if (!c) return null;
  const repos = new Map<string, ContributionRepo>();
  const dayOf = (repo: ContributionRepo, date: string): ContributionDay => {
    let d = repo.days.find((x) => x.date === date);
    if (!d) {
      d = { date, commits: 0, prsOpened: 0, issuesOpened: 0 };
      repo.days.push(d);
    }
    return d;
  };
  const fold = (
    list: RawRepo[] | undefined,
    field: "commits" | "prsOpened" | "issuesOpened"
  ) => {
    for (const entry of list ?? []) {
      const owner = entry.repository?.owner?.login;
      const name = entry.repository?.name;
      if (!owner || !name) continue;
      const key = repoKey(owner, name);
      let repo = repos.get(key);
      if (!repo) {
        repo = { owner, name, isPrivate: false, days: [] };
        repos.set(key, repo);
      }
      // Fail closed: any list calling the repo private makes it private.
      if (entry.repository?.isPrivate !== false) repo.isPrivate = true;
      for (const node of entry.contributions?.nodes ?? []) {
        if (!node.occurredAt || Number.isNaN(Date.parse(node.occurredAt))) continue;
        const date =
          field === "commits"
            ? commitContributionDay(node.occurredAt)
            : node.occurredAt.slice(0, 10);
        const day = dayOf(repo, date);
        day[field] += field === "commits" ? Math.max(0, node.commitCount ?? 0) : 1;
      }
    }
  };
  fold(c.commitContributionsByRepository, "commits");
  fold(c.pullRequestContributionsByRepository, "prsOpened");
  fold(c.issueContributionsByRepository, "issuesOpened");
  return [...repos.values()];
}

/**
 * Pure: keep only catalog projects (listed ones), decide privacy fail-closed
 * (GitHub's isPrivate OR the catalog flag), and merge repos that map to the
 * same catalog entry. Repositories without a catalog entry are dropped.
 */
export function mapContributionsToCatalog(
  repos: ContributionRepo[],
  catalog: ProjectConfig[] = listedProjects()
): SignalContribution[] {
  const byRepo = new Map<string, ProjectConfig>();
  for (const p of catalog) {
    if (p.repoName) byRepo.set(repoKey(resolveRepoOwner(p), p.repoName), p);
  }
  const bySlug = new Map<string, SignalContribution>();
  for (const repo of repos) {
    const cfg = byRepo.get(repoKey(repo.owner, repo.name));
    if (!cfg) continue;
    const existing = bySlug.get(cfg.slug);
    const target: SignalContribution = existing ?? {
      slug: cfg.slug,
      displayName: cfg.displayName,
      catalogPrivate: Boolean(cfg.private),
      githubPrivate: false,
      days: [],
    };
    if (repo.isPrivate) target.githubPrivate = true;
    for (const d of repo.days) {
      const hit = target.days.find((x) => x.date === d.date);
      if (hit) {
        hit.commits += d.commits;
        hit.prsOpened += d.prsOpened;
        hit.issuesOpened += d.issuesOpened;
      } else {
        target.days.push({ ...d });
      }
    }
    bySlug.set(cfg.slug, target);
  }
  return [...bySlug.values()];
}

/** Window bounds snap to the start of the UTC hour so the fetch cache key is stable. */
function hourFloor(ms: number): string {
  return new Date(Math.floor(ms / MS_HOUR) * MS_HOUR).toISOString();
}

/**
 * One GraphQL call. Never rejects: returns [] on any failure and callers
 * render without it. Failures log status or error type only, never tokens,
 * response bodies or repository names.
 */
export async function getSignalContributions(
  sinceMs: number,
  revalidateSeconds: number
): Promise<SignalContribution[]> {
  try {
    const token = await getGithubAccessToken();
    if (!token) return [];
    const res = await fetch(`${GITHUB_API_BASE}/graphql`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "portfolio-hub",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          login: GITHUB_ACCOUNT_LOGIN,
          from: hourFloor(sinceMs),
          to: hourFloor(Date.now()),
        },
      }),
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(18_000),
    });
    if (!res.ok) {
      console.warn(`[signal-contributions] GitHub GraphQL returned HTTP ${res.status}`);
      return [];
    }
    const json = (await res.json()) as RawResponse;
    if (json.errors?.length) {
      console.warn(
        `[signal-contributions] GitHub GraphQL returned ${json.errors.length} error(s): ${json.errors
          .map((e) => (typeof e?.type === "string" ? e.type : "UNKNOWN"))
          .join(",")}`
      );
      return [];
    }
    const repos = parseContributionResponse(json);
    if (!repos) {
      console.warn("[signal-contributions] GitHub GraphQL returned no readable user");
      return [];
    }
    return mapContributionsToCatalog(repos);
  } catch (err) {
    const kind = err instanceof Error ? err.name : "UnknownError";
    console.warn(`[signal-contributions] request failed: ${kind}`);
    return [];
  }
}
