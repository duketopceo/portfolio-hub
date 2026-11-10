import { listedProjects } from "@/lib/catalog";
import type { ProjectConfig } from "@/lib/types";
import type {
  ContributionDay,
  SignalContribution,
} from "@/lib/signal-summary";
import { getGithubAccessToken } from "@/lib/github-app";
import { GITHUB_ACCOUNT_LOGIN, GITHUB_API_BASE } from "@/lib/github-constants";

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

/** Pure: fold the three GraphQL lists into per-repo, per-UTC-day counts. */
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
        const day = dayOf(repo, node.occurredAt.slice(0, 10));
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
  const bySlug = new Map<string, SignalContribution>();
  for (const repo of repos) {
    const key = repoKey(repo.owner, repo.name);
    const cfg = catalog.find(
      (p) =>
        p.repoName &&
        repoKey(p.repoOwner ?? GITHUB_ACCOUNT_LOGIN, p.repoName) === key
    );
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

/** One GraphQL call. Returns [] on any failure; callers render without it. */
export async function getSignalContributions(
  sinceMs: number,
  revalidateSeconds: number
): Promise<SignalContribution[]> {
  const token = await getGithubAccessToken();
  if (!token) return [];
  try {
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
          from: new Date(sinceMs).toISOString(),
          to: new Date().toISOString(),
        },
      }),
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(18_000),
    });
    if (!res.ok) return [];
    const repos = parseContributionResponse((await res.json()) as RawResponse);
    return repos ? mapContributionsToCatalog(repos) : [];
  } catch {
    return [];
  }
}
