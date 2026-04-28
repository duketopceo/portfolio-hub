export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count?: number;
  created_at: string;
  pushed_at: string;
  homepage: string | null;
  default_branch: string;
  archived: boolean;
  size: number;
  fork: boolean;
  html_url: string;
  private: boolean;
}

export type ProjectCategory =
  | "finance"
  | "ai"
  | "osint"
  | "infra"
  | "apps"
  | "data";

export type ProjectType =
  | "app"
  | "library"
  | "infra"
  | "experiment"
  | "platform";

export interface ProjectConfig {
  slug: string;
  repoName: string;
  displayName: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  type: ProjectType;
  featured: boolean;
  liveUrl?: string;
  /** Embeddable demo URL (for iframe preview) — may differ from liveUrl */
  demoUrl?: string;
  /** If true, liveUrl can be iframed on the detail page */
  embeddable?: boolean;
  /** If true, the demo subdomain is offline — show ProjectPreview instead of iframe */
  demoOffline?: boolean;
  subdomain?: string;
  techStack: string[];
  private: boolean;
  highlights: string[];
  /** Optional screenshots or preview image URLs */
  previewImages?: string[];
  /** High-level architecture description */
  architecture?: string;
  /** Private project dossier — 2–4 sentences: problem, users, real-world impact */
  businessContext?: string;
  /** Private project dossier — 1–3 sentences: volume, accounts, throughput, reach */
  scopeAndScale?: string;
  /** Private project dossier — "Decision — Rationale" strings */
  engineeringDecisions?: string[];
}

export interface EnrichedProject extends ProjectConfig {
  repo: GitHubRepo | null;
  lastUpdated: string;
  language: string | null;
  stars: number;
  forks: number;
  /** Open issues count from GitHub when token can read the repo */
  openIssuesCount: number;
}
