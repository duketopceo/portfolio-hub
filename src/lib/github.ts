import { GitHubRepo, EnrichedProject } from "./types";
import { projectConfigs } from "@/data/projects";

const GITHUB_API = "https://api.github.com";
const GITHUB_USER = process.env.GITHUB_USER || "duketopceo";
const TOKEN = process.env.GITHUB_TOKEN;

/**
 * Headers for GitHub API requests.
 */
function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-hub",
  };
  if (TOKEN) {
    h.Authorization = `Bearer ${TOKEN}`;
  }
  return h;
}

/**
 * Fetch all repos for the configured GitHub user.
 */
export async function fetchAllRepos(): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;

  while (page <= 3) {
    const url = TOKEN
      ? `${GITHUB_API}/user/repos?per_page=100&page=${page}&affiliation=owner&sort=updated`
      : `${GITHUB_API}/users/${GITHUB_USER}/repos?per_page=100&page=${page}&sort=updated`;

    const res = await fetch(url, {
      headers: headers(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`GitHub API error: ${res.status} ${res.statusText}`);
      break;
    }

    const repos: GitHubRepo[] = await res.json();
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
  const res = await fetch(url, {
    headers: {
      ...headers(),
      Accept: "application/vnd.github.html+json",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;
  return res.text();
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
 * Get the N most recently active projects.
 */
export async function getRecentProjects(n = 5): Promise<EnrichedProject[]> {
  const all = await getEnrichedProjects();
  return all
    .filter((p) => p.lastUpdated)
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )
    .slice(0, n);
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
