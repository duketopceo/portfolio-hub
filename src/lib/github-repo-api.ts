import { projectConfigs } from "@/data/projects";
import { GITHUB_ACCOUNT_LOGIN, GITHUB_API_BASE } from "@/lib/github-constants";
import { getGithubAccessToken } from "@/lib/github-app";

export const curatedRepoNames = new Set(
  projectConfigs.filter((p) => !p.siteOnly).map((p) => p.repoName)
);

export const repoNameToMeta = new Map(
  projectConfigs.map((p) => [
    p.repoName,
    { slug: p.slug, displayName: p.displayName },
  ])
);

export function isCuratedRepoName(repoName: string): boolean {
  return curatedRepoNames.has(repoName);
}

export type PrStatusKind =
  | "draft"
  | "open"
  | "review_requested"
  | "approved";

export type CiStateKind =
  | "success"
  | "failure"
  | "pending"
  | "error"
  | "skipped"
  | "unknown";

export interface PullPayload {
  number: number;
  title: string;
  author: string;
  branch: string;
  updatedAt: string;
  htmlUrl: string;
  draft: boolean;
  status: PrStatusKind;
}

interface GhUser {
  login: string;
}

interface GhPull {
  number: number;
  title: string;
  draft: boolean;
  updated_at: string;
  html_url: string;
  user: GhUser | null;
  head: { ref: string };
  requested_reviewers?: GhUser[];
}

interface GhReview {
  state: string;
}

interface GhRepoFull {
  name: string;
  description: string | null;
  language: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  private: boolean;
}

interface GhCommit {
  sha: string;
}

interface GhCombinedStatus {
  state: string;
}

async function ghFetch<T>(
  path: string,
  revalidateSeconds: number
): Promise<
  | { ok: true; data: T }
  | { ok: false; status: number; timeout?: boolean }
> {
  const token = await getGithubAccessToken();
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-hub",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${GITHUB_API_BASE}${path}`, {
      headers,
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return { ok: false, status: res.status };
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, status: 0, timeout: true };
    }
    throw err;
  }
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    for (;;) {
      const i = cursor++;
      if (i >= items.length) break;
      results[i] = await fn(items[i], i);
    }
  }
  if (items.length === 0) return [];
  const n = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

async function fetchPrStatus(
  owner: string,
  repo: string,
  pullNumber: number,
  draft: boolean,
  hasReviewers: boolean
): Promise<PrStatusKind> {
  if (draft) return "draft";
  if (hasReviewers) return "review_requested";

  const rev = await ghFetch<GhReview[]>(
    `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
    180
  );
  if (!rev.ok) return "open";
  const approved = rev.data.some((r) => r.state === "APPROVED");
  if (approved) return "approved";
  return "open";
}

export async function fetchLatestCiState(
  owner: string,
  repo: string,
  defaultBranch: string
): Promise<{ sha: string | null; ci: CiStateKind }> {
  const commits = await ghFetch<GhCommit[]>(
    `/repos/${owner}/${repo}/commits?per_page=1&sha=${encodeURIComponent(defaultBranch)}`,
    180
  );
  if (!commits.ok || !commits.data.length) {
    return { sha: null, ci: "unknown" };
  }
  const sha = commits.data[0].sha;
  const status = await ghFetch<GhCombinedStatus>(
    `/repos/${owner}/${repo}/commits/${sha}/status`,
    180
  );
  if (!status.ok) return { sha, ci: "unknown" };
  const s = status.data.state?.toLowerCase();
  if (s === "success") return { sha, ci: "success" };
  if (s === "failure") return { sha, ci: "failure" };
  if (s === "pending") return { sha, ci: "pending" };
  if (s === "error") return { sha, ci: "error" };
  return { sha, ci: "unknown" };
}

export type RepoSummaryPayload = {
  repo: string;
  slug: string;
  displayName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string;
  private: boolean;
  githubPath: string;
  pulls: PullPayload[];
  ci: CiStateKind;
  ciSha: string | null;
};

export type RepoSummaryFetchResult =
  | { ok: true; payload: RepoSummaryPayload }
  | { ok: false; timeout: true }
  | { ok: false; timeout?: false; status: number };

export async function fetchRepoSummaryPayload(
  repoName: string
): Promise<RepoSummaryFetchResult> {
  const owner = GITHUB_ACCOUNT_LOGIN;
  const meta = repoNameToMeta.get(repoName);
  const slug = meta?.slug ?? repoName;
  const displayName = meta?.displayName ?? repoName;

  const repoRes = await ghFetch<GhRepoFull>(
    `/repos/${owner}/${encodeURIComponent(repoName)}`,
    180
  );
  if (!repoRes.ok) {
    if (repoRes.timeout) return { ok: false, timeout: true };
    return { ok: false, status: repoRes.status };
  }
  const r = repoRes.data;

  const pullsRes = await ghFetch<GhPull[]>(
    `/repos/${owner}/${encodeURIComponent(repoName)}/pulls?state=open&per_page=30`,
    180
  );
  if (!pullsRes.ok && pullsRes.timeout) {
    return { ok: false, timeout: true };
  }
  const rawPulls = pullsRes.ok ? pullsRes.data : [];

  const statuses = await runWithConcurrency(rawPulls, 4, async (pr) => {
    const hasRv =
      (pr.requested_reviewers?.length ?? 0) > 0 ||
      false; /* teams omitted for brevity */
    const st = await fetchPrStatus(
      owner,
      repoName,
      pr.number,
      !!pr.draft,
      hasRv
    );
    return {
      number: pr.number,
      title: pr.title,
      author: pr.user?.login ?? "unknown",
      branch: pr.head.ref,
      updatedAt: pr.updated_at,
      htmlUrl: pr.html_url,
      draft: !!pr.draft,
      status: st,
    } satisfies PullPayload;
  });

  const { sha, ci } = await fetchLatestCiState(
    owner,
    repoName,
    r.default_branch || "main"
  );

  return {
    ok: true,
    payload: {
      repo: repoName,
      slug,
      displayName,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      openIssues: r.open_issues_count,
      pushedAt: r.pushed_at,
      private: r.private,
      githubPath: `${owner}/${repoName}`,
      pulls: statuses,
      ci,
      ciSha: sha,
    },
  };
}

export async function fetchAllOpenPullsAggregated(): Promise<
  Array<
    PullPayload & {
      repoName: string;
      slug: string;
      displayName: string;
    }
  >
> {
  const owner = GITHUB_ACCOUNT_LOGIN;
  const uniqueNames = [
    ...new Set(
      projectConfigs
        .filter((p) => !p.siteOnly && p.repoName)
        .map((p) => p.repoName)
    ),
  ];

  const perRepo = await runWithConcurrency(uniqueNames, 4, async (repoName) => {
    const meta = repoNameToMeta.get(repoName)!;
    const pullsRes = await ghFetch<GhPull[]>(
      `/repos/${owner}/${encodeURIComponent(repoName)}/pulls?state=open&per_page=20`,
      240
    );
    if (!pullsRes.ok) return [] as Array<
      PullPayload & {
        repoName: string;
        slug: string;
        displayName: string;
      }
    >;

    const rows = await runWithConcurrency(pullsRes.data, 3, async (pr) => {
      const hasRv = (pr.requested_reviewers?.length ?? 0) > 0;
      const status = await fetchPrStatus(
        owner,
        repoName,
        pr.number,
        !!pr.draft,
        hasRv
      );
      return {
        repoName,
        slug: meta.slug,
        displayName: meta.displayName,
        number: pr.number,
        title: pr.title,
        author: pr.user?.login ?? "unknown",
        branch: pr.head.ref,
        updatedAt: pr.updated_at,
        htmlUrl: pr.html_url,
        draft: !!pr.draft,
        status,
      };
    });
    return rows;
  });

  const flat = perRepo.flat();
  flat.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return flat;
}
