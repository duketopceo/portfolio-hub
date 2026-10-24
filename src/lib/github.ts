import { GitHubRepo, EnrichedProject, LatestRelease } from "./types";
import { listedProjects } from "@/lib/catalog";
import { applyDeploymentOverlay } from "@/lib/deployments";
import { publicGithubUrl } from "@/lib/github-public-url";
import { GITHUB_ACCOUNT_LOGIN, GITHUB_API_BASE } from "@/lib/github-constants";
import { getGithubAccessToken } from "@/lib/github-app";
import {
  classifyHttpStatus,
  failureFromUnknown,
  logGithubFailure,
  parseGithubErrorBody,
  rateLimitResetFromHeaders,
  type GithubRequestFailure,
} from "./github-errors";
import { scrubEmails } from "@/lib/readme-scrub";
import { prepareReadmeHtml } from "@/lib/readme-html";
import { fetchLatestCiState, type CiStateKind } from "@/lib/github-repo-api";

export { GITHUB_ACCOUNT_LOGIN, GITHUB_API_BASE } from "@/lib/github-constants";

const GITHUB_USER = GITHUB_ACCOUNT_LOGIN;
const GITHUB_API = GITHUB_API_BASE;
const SHOWCASE_FILENAME = "SHOWCASE.md";

/** Builds and visual tests set this so output never depends on live GitHub. */
function fixturesEnabled(): boolean {
  return process.env.ACTIVITY_USE_FIXTURES === "1";
}

/**
 * Headers for GitHub API requests (server-side only).
 */
export async function githubAuthHeaders(): Promise<HeadersInit> {
  const h: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-hub",
  };
  const token = await getGithubAccessToken();
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

async function handleFailedGithubResponse(
  res: Response,
  context: string
): Promise<GithubRequestFailure> {
  const bodySnippet = await parseGithubErrorBody(res);
  const kind = classifyHttpStatus(res.status);
  const rateLimitReset =
    kind === "rate_limited" || res.status === 403
      ? rateLimitResetFromHeaders(res)
      : undefined;
  return {
    kind,
    status: res.status,
    message: `${context}: ${bodySnippet}`,
    rateLimitReset,
  };
}

/**
 * Fetch all repos for the configured GitHub user / app installation.
 */
export async function fetchAllRepos(): Promise<GitHubRepo[]> {
  if (fixturesEnabled()) return [];
  const token = await getGithubAccessToken();
  const allRepos: GitHubRepo[] = [];
  let page = 1;

  for (;;) {
    const url = token
      ? `${GITHUB_API}/user/repos?type=all&sort=updated&per_page=100&page=${page}`
      : `${GITHUB_API}/users/${GITHUB_USER}/repos?per_page=100&page=${page}&sort=updated`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: await githubAuthHeaders(),
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err) {
      const failure = failureFromUnknown(`fetchAllRepos page ${page}`, err);
      logGithubFailure("fetchAllRepos", failure);
      break;
    }

    if (!res.ok) {
      const failure = await handleFailedGithubResponse(
        res,
        `fetchAllRepos page ${page}`
      );
      logGithubFailure("fetchAllRepos", failure);
      break;
    }

    let repos: GitHubRepo[];
    try {
      repos = (await res.json()) as GitHubRepo[];
    } catch {
      logGithubFailure("fetchAllRepos", {
        kind: "parse",
        message: "Invalid JSON in repos list response",
      });
      break;
    }

    if (!Array.isArray(repos) || repos.length === 0) break;

    allRepos.push(...repos);
    if (repos.length < 100) break;
    page++;
  }

  return allRepos;
}

async function fetchRepoLanguages(
  repoName: string,
  owner: string = GITHUB_USER
): Promise<string[]> {
  if (fixturesEnabled()) return [];
  const url = `${GITHUB_API}/repos/${owner}/${repoName}/languages`;
  try {
    const res = await fetch(url, {
      headers: await githubAuthHeaders(),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, number>;
    return Object.keys(data).sort(
      (a, b) => (data[b] ?? 0) - (data[a] ?? 0)
    );
  } catch {
    return [];
  }
}

/**
 * Default branch and README path, needed to resolve relative image links.
 * Best-effort: falls back to `main` and the repo root.
 */
async function fetchReadmeLocation(
  repoName: string,
  owner: string
): Promise<{ branch: string; readmePath: string }> {
  const headers = await githubAuthHeaders();
  const base = `${GITHUB_API}/repos/${owner}/${encodeURIComponent(repoName)}`;
  const get = async <T>(url: string): Promise<T | null> => {
    try {
      const res = await fetch(url, {
        headers,
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10_000),
      });
      return res.ok ? ((await res.json()) as T) : null;
    } catch {
      return null;
    }
  };
  const [repo, readme] = await Promise.all([
    get<{ default_branch?: string }>(base),
    get<{ path?: string }>(`${base}/readme`),
  ]);
  return {
    branch: repo?.default_branch || "main",
    readmePath: readme?.path || "README.md",
  };
}

/**
 * Fetch the README content for a public repo (rendered as HTML).
 * Never called for private repos on the dossier page.
 */
export async function fetchReadme(
  repoName: string,
  owner: string = GITHUB_USER,
  projectNames: string[] = []
): Promise<string | null> {
  if (fixturesEnabled()) return null;
  const url = `${GITHUB_API}/repos/${owner}/${repoName}/readme`;

  try {
    const res = await fetch(url, {
      headers: {
        ...(await githubAuthHeaders()),
        Accept: "application/vnd.github.html+json",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      if (res.status !== 404) {
        const failure = await handleFailedGithubResponse(
          res,
          `fetchReadme ${repoName}`
        );
        logGithubFailure("fetchReadme", failure);
      }
      return null;
    }

    const html = await res.text();
    const { branch, readmePath } = await fetchReadmeLocation(repoName, owner);
    return scrubEmails(
      prepareReadmeHtml(html, {
        owner,
        repo: repoName,
        branch,
        readmePath,
        projectNames: [repoName, ...projectNames],
      })
    );
  } catch (err) {
    const failure = failureFromUnknown(`fetchReadme ${repoName}`, err);
    logGithubFailure("fetchReadme", failure);
    return null;
  }
}

interface GhContentFile {
  name: string;
  content?: string;
  encoding?: string;
}

/**
 * Fetch SHOWCASE.md at repo root for private dossiers (allowlisted filename only).
 */
export async function fetchShowcaseMd(
  repoName: string,
  owner: string = GITHUB_USER
): Promise<string | null> {
  if (!repoName || fixturesEnabled()) return null;

  const url = `${GITHUB_API}/repos/${owner}/${encodeURIComponent(repoName)}/contents/${SHOWCASE_FILENAME}`;

  try {
    const res = await fetch(url, {
      headers: await githubAuthHeaders(),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as GhContentFile;
    if (data.name !== SHOWCASE_FILENAME) return null;
    if (!data.content || data.encoding !== "base64") return null;

    return scrubEmails(Buffer.from(data.content, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Latest published release for a PUBLIC repo. 404 means "no release" and every
 * failure degrades to undefined, so a release lookup can never break a page or
 * the build. Callers must not pass private repos (privacy gate).
 */
export async function fetchLatestRelease(
  repoName: string,
  owner: string = GITHUB_USER
): Promise<LatestRelease | undefined> {
  if (!repoName || fixturesEnabled()) return undefined;
  const url = `${GITHUB_API}/repos/${owner}/${encodeURIComponent(repoName)}/releases/latest`;
  try {
    const res = await fetch(url, {
      headers: await githubAuthHeaders(),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      if (res.status !== 404) {
        const failure = await handleFailedGithubResponse(
          res,
          `fetchLatestRelease ${repoName}`
        );
        logGithubFailure("fetchLatestRelease", failure);
      }
      return undefined;
    }
    const data = (await res.json()) as {
      tag_name?: string;
      published_at?: string | null;
      html_url?: string;
    };
    if (!data.tag_name || !data.published_at || !data.html_url) return undefined;
    if (!data.html_url.startsWith("https://github.com/")) return undefined;
    return {
      tag: data.tag_name,
      publishedAt: data.published_at,
      url: data.html_url,
    };
  } catch (err) {
    logGithubFailure(
      "fetchLatestRelease",
      failureFromUnknown(`fetchLatestRelease ${repoName}`, err)
    );
    return undefined;
  }
}

function mapCiStatus(ci: CiStateKind): EnrichedProject["ciStatus"] {
  if (ci === "success") return "success";
  if (ci === "failure" || ci === "error") return "failure";
  if (ci === "pending") return "pending";
  return "unknown";
}

/**
 * Enrich project configs with live GitHub data.
 * SECURITY: Strips sensitive fields before returning.
 */
export async function getEnrichedProjects(): Promise<EnrichedProject[]> {
  const allRepos = await fetchAllRepos();
  const repoMap = new Map<string, GitHubRepo>();
  for (const repo of allRepos) {
    // Keyed by owner+name, lowercased: /user/repos includes collaborator and
    // org-member repos, so a name-only key would let another owner's same-name
    // repository stand in for the configured one.
    if (!repo.owner?.login) continue;
    repoMap.set(`${repo.owner.login}/${repo.name}`.toLowerCase(), repo);
  }

  const enriched = await Promise.all(
    listedProjects().map(async (config) => {
      const withDeploy = applyDeploymentOverlay(config);
      if (withDeploy.siteOnly) {
        return {
          ...withDeploy,
          githubUrl: null,
          private: false,
          repo: null,
          lastUpdated: "",
          language: null,
          languages: [],
          stars: 0,
          forks: 0,
          topics: [],
          openIssuesCount: 0,
          ciStatus: null,
        } satisfies EnrichedProject;
      }

      const owner = withDeploy.repoOwner ?? GITHUB_ACCOUNT_LOGIN;
      const repo =
        repoMap.get(`${owner}/${withDeploy.repoName}`.toLowerCase()) || null;
      const githubUrl = publicGithubUrl(
        withDeploy.private || repo?.private === true,
        withDeploy.repoName,
        owner
      );

      let languages: string[] = [];
      const ciStatus: EnrichedProject["ciStatus"] = null;

      if (repo?.language) {
        languages = [repo.language];
      }

      const isPrivate = withDeploy.private || repo?.private === true;

      const latestRelease = isPrivate
        ? undefined
        : await fetchLatestRelease(withDeploy.repoName, owner);

      return {
        ...withDeploy,
        githubUrl,
        // Monotonic: a configured-private project is never downgraded to public
        // by whatever the API reports for a same-name repository.
        private: withDeploy.private || repo?.private === true,
        repo: null,
        lastUpdated: repo?.pushed_at || "",
        language: repo?.language || null,
        languages,
        stars: repo?.stargazers_count || 0,
        forks: repo?.forks_count || 0,
        topics: isPrivate ? [] : (repo?.topics ?? []).slice(0, 3),
        openIssuesCount: repo?.open_issues_count ?? 0,
        ciStatus,
        ...(latestRelease ? { latestRelease } : {}),
      } satisfies EnrichedProject;
    })
  );

  return enriched;
}

export async function getFeaturedProjects(): Promise<EnrichedProject[]> {
  const all = await getEnrichedProjects();
  return all.filter((p) => p.featured);
}

export async function getRecentProjects(n = 5): Promise<EnrichedProject[]> {
  const all = await getEnrichedProjects();
  const dated = all
    .filter((p) => p.lastUpdated)
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )
    .slice(0, n);
  if (dated.length > 0) return dated;
  return all.slice(0, n);
}

export async function getProjectBySlug(
  slug: string
): Promise<EnrichedProject | null> {
  const all = await getEnrichedProjects();
  return all.find((p) => p.slug === slug) || null;
}

export function getAllSlugs(): string[] {
  return listedProjects().map((p) => p.slug);
}

/**
 * Dossier-only enrichment: language mix + CI checks (server-side).
 */
export async function enrichProjectActivity(
  project: EnrichedProject
): Promise<EnrichedProject> {
  if (project.siteOnly || !project.repoName || fixturesEnabled()) return project;

  const owner = project.repoOwner ?? GITHUB_USER;
  const languages = await fetchRepoLanguages(project.repoName, owner);
  const repoRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${encodeURIComponent(project.repoName)}`,
    {
      headers: await githubAuthHeaders(),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    }
  );

  let ciStatus: EnrichedProject["ciStatus"] = null;
  if (repoRes.ok) {
    const repo = (await repoRes.json()) as GitHubRepo;
    const { ci } = await fetchLatestCiState(
      owner,
      project.repoName,
      repo.default_branch || "main"
    );
    ciStatus = mapCiStatus(ci);
    return {
      ...project,
      languages: languages.length > 0 ? languages : project.languages,
      lastUpdated: repo.pushed_at || project.lastUpdated,
      language: repo.language || project.language,
      ciStatus,
    };
  }

  return {
    ...project,
    languages: languages.length > 0 ? languages : project.languages,
    ciStatus,
  };
}
