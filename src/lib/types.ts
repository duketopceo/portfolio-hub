export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
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
  subdomain?: string;
  techStack: string[];
  private: boolean;
  highlights: string[];
  /** Optional screenshots or preview image URLs */
  previewImages?: string[];
}

export interface EnrichedProject extends ProjectConfig {
  repo: GitHubRepo | null;
  lastUpdated: string;
  language: string | null;
  stars: number;
  forks: number;
}
