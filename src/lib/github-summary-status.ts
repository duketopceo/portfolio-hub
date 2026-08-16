import { projectConfigs } from "@/data/projects";

export type GithubSummaryOutcome =
  | { type: "skipped" }
  | { type: "missing-token" }
  | { type: "ok" }
  | { type: "http"; status: number }
  | { type: "timeout" };

export type SummaryStatusResult =
  | { httpStatus: 404; bodyKind: "unknown" }
  | { httpStatus: 200; bodyKind: "fallback" }
  | { httpStatus: 200; bodyKind: "full" }
  | { httpStatus: 502; bodyKind: "unavailable" };

export function mapGithubSummaryStatus(input: {
  curated: boolean;
  catalogPrivate: boolean;
  github: GithubSummaryOutcome;
}): SummaryStatusResult {
  if (!input.curated) {
    return { httpStatus: 404, bodyKind: "unknown" };
  }
  if (input.catalogPrivate) {
    return { httpStatus: 200, bodyKind: "fallback" };
  }
  switch (input.github.type) {
    case "ok":
      return { httpStatus: 200, bodyKind: "full" };
    case "missing-token":
    case "skipped":
      return { httpStatus: 200, bodyKind: "fallback" };
    case "timeout":
      return { httpStatus: 502, bodyKind: "unavailable" };
    case "http": {
      const status = input.github.status;
      if (status === 401 || status === 403 || status === 404) {
        return { httpStatus: 200, bodyKind: "fallback" };
      }
      if (status >= 500) {
        return { httpStatus: 502, bodyKind: "unavailable" };
      }
      return { httpStatus: 200, bodyKind: "fallback" };
    }
    default: {
      const _exhaustive: never = input.github;
      return _exhaustive;
    }
  }
}

export interface CuratedSummaryFallback {
  repo: string;
  slug: string;
  displayName: string;
  description: string | null;
  language: null;
  stars: 0;
  forks: 0;
  openIssues: 0;
  pushedAt: "";
  private: boolean;
  pulls: [];
  ci: "unknown";
  ciSha: null;
}

export function isCatalogPrivateRepo(repoName: string): boolean {
  const cfg = projectConfigs.find((p) => p.repoName === repoName);
  return cfg?.private === true;
}

export function hasGithubToken(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

export function curatedSummaryFallback(repoName: string): CuratedSummaryFallback {
  const cfg = projectConfigs.find((p) => p.repoName === repoName);
  return {
    repo: repoName,
    slug: cfg?.slug ?? repoName,
    displayName: cfg?.displayName ?? repoName,
    description: cfg?.description ?? null,
    language: null,
    stars: 0,
    forks: 0,
    openIssues: 0,
    pushedAt: "",
    private: cfg?.private ?? true,
    pulls: [],
    ci: "unknown",
    ciSha: null,
  };
}
