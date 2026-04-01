import { GitHubRepo, EnrichedProject } from "./types";
import { projectConfigs } from "@/data/projects";
import {
  classifyHttpStatus,
  failureFromUnknown,
  logGithubFailure,
  parseGithubErrorBody,
  rateLimitResetFromHeaders,
  type GithubRequestFailure,
} from "./github-errors";

const GITHUB_API = "https://api.github.com";
const GITHUB_USER = process.env.GITHUB_USER || "duketopceo";
const TOKEN = process.env.GITHUB_TOKEN;

/**
 * Headers for GitHub API requests.
 */
function authHeaders(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-hub",
  };
  if (TOKEN) {
    h.Authorization = `Bearer ${TOKEN}`;
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
 * Fetch all repos for the configured GitHub user.
 * On failure, logs a structured error and returns [] so curated data still renders.
 */
export async function fetchAllRepos(): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;

  while (page <= 3) {
    const url = TOKEN
      ? `${GITHUB_API}/user/repos?per_page=100&page=${page}&affiliation=owner&sort=updated`
      : `${GITHUB_API}/users/${GITHUB_USER}/repos?per_page=100&page=${page}&sort=updated`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: authHeaders(),
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err) {
      const failure = failureFromUnknown(`fetchAllRepos page ${page}`, err);
      logGithubFailure("fetchAllRepos", failure);
      break;
    }

    if (!res.ok) {
      const failure = await handleFailedGithubResponse(res, `fetchAllRepos page ${page}`);
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

    if (!Array.isArray(repos)) {
      logGithubFailure("fetchAllRepos", {
        kind: "parse",
        message: "Expected array in repos list response",
      });
      break;
    }

    if (repos.length === 0) break;

    allRepos.push(...repos);
    if (repos.length < 100) break;
    page++;
  }

  return allRepos;
}

/**
 * Fetch the README content for a public repo (rendered as HTML).
 * Only fetched for public repos — private repos use curated descriptions.
 */
export async function fetchReadme(repoName: string): Promise<string | null> {
  const url = `${GITHUB_API}/repos/${GITHUB_USER}/${repoName}/readme`;

  try {
    const res = await fetch(url, {
      headers: {
        ...authHeaders(),
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

    try {
      return await res.text();
    } catch (err) {
      const failure = failureFromUnknown(`fetchReadme ${repoName} body`, err);
      logGithubFailure("fetchReadme", failure);
      return null;
    }
  } catch (err) {
    const failure = failureFromUnknown(`fetchReadme ${repoName}`, err);
    logGithubFailure("fetchReadme", failure);
    return null;
  }
}

/**
 * Enrich project configs with live GitHub data.
 * SECURITY: Strips sensitive fields before returning.
 */
export async function getEnrichedProjects(): Promise<EnrichedProject[]> {
  const allRepos = await fetchAllRepos();
  const repoMap = new Map<string, GitHubRepo>();
  for (const repo of allRepos) {
    repoMap.set(repo.name, repo);
  }

  return projectConfigs.map((config) => {
    const repo = repoMap.get(config.repoName) || null;
    return {
      ...config,
      repo: null, // Never expose raw repo data to client
      lastUpdated: repo?.pushed_at || "",
      language: repo?.language || null,
      stars: repo?.stargazers_count || 0,
      forks: repo?.forks_count || 0,
    };
  });
}

/**
 * Get featured projects.
 */
export async function getFeaturedProjects(): Promise<EnrichedProject[]> {
  const all = await getEnrichedProjects();
  return all.filter((p) => p.featured);
}

/**
 * Get the N most recently active projects (by `lastUpdated` from GitHub).
 * If no project has a push date (API failure, rate limit, or missing GITHUB_TOKEN
 * in production), falls back to the first N curated projects so /now is never empty.
 */
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

/**
 * Get a single enriched project by slug.
 */
export async function getProjectBySlug(
  slug: string
): Promise<EnrichedProject | null> {
  const all = await getEnrichedProjects();
  return all.find((p) => p.slug === slug) || null;
}

/**
 * Generate all valid project slugs (for static generation).
 */
export function getAllSlugs(): string[] {
  return projectConfigs.map((p) => p.slug);
}
