export interface GitHubRepo {
  name: string;
  /** Owner login. Required to key repos by owner+name — a name-only key lets a
   *  same-name repository from another owner replace the configured one. */
  owner: { login: string };
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

/** Homepage placement — featured five, secondary orbit (~20), or grid-only. */
export type OrbitTier = "featured" | "secondary" | "catalog-only";

/** Visual scale for orbit planets — primary featured use lg/xl; secondary use xs–md. */
export type PlanetSize = "xs" | "sm" | "md" | "lg" | "xl";

export type PlanetShape = "sphere" | "hex" | "diamond" | "cube";

export type PlanetMoonKind = "subproject" | "live" | "stack";

/** Orbiting marker — sub-project link, live URL, or stack badge (real catalog data). */
export interface PlanetMoonConfig {
  label: string;
  kind: PlanetMoonKind;
  href?: string;
}

export interface PlanetRingConfig {
  color?: string;
  opacity?: number;
  /** Ellipse tilt in degrees */
  tilt?: number;
}

/** Per-world visual module config for homepage orbits. */
export interface PlanetVisualConfig {
  size?: PlanetSize;
  shape?: PlanetShape;
  /** Override category accent hex */
  color?: string;
  rings?: PlanetRingConfig[];
  moons?: PlanetMoonConfig[];
}

/** One recorded video. `captions` is a path under the site origin. */
export interface MediaAsset {
  url: string;
  poster?: string;
  captions?: string;
  transcript: string;
}

/** Present, still to be recorded, or not applicable. */
export type MediaSlot = MediaAsset | "to-record" | "n/a";

/** The video asset in a slot, or null when it is unrecorded or not applicable. */
export function mediaAsset(slot: MediaSlot): MediaAsset | null {
  return typeof slot === "string" ? null : slot;
}

export type MediaKind = "release" | "demo";

export interface ProjectMedia {
  release: MediaSlot;
  demo: MediaSlot;
}

/** Hand-written showcase copy for a private project. Never fetched at runtime. */
export interface ProjectShowcase {
  whatItIs: string;
  whoItsFor: string;
  whatLukeBuilt: string;
  stack: string[];
  status: string;
  problem?: string;
  approach?: string;
  architecture?: string;
  outcomes?: string;
}

export interface ProjectConfig {
  slug: string;
  repoName: string;
  /** GitHub owner/org — defaults to the portfolio account login (GITHUB_USER). */
  repoOwner?: string;
  displayName: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  type: ProjectType;
  featured: boolean;
  /**
   * Homepage orbit tier. Default: featured five → secondary orbit for the rest.
   * Set `catalog-only` to keep a project off the homepage rings (grid/dossier only).
   */
  orbitTier?: OrbitTier;
  /** Homepage planet appearance — size, shape, rings, moons (see SOP). */
  planetVisual?: PlanetVisualConfig;
  liveUrl?: string;
  /** Embeddable demo URL (for iframe preview) — may differ from liveUrl */
  demoUrl?: string;
  /** Release video and demo recording for the dossier; shown on private
   *  entries too. Video assets live on the existing media host only. */
  media: ProjectMedia;
  /** Hand-written card shown in place of activity/README on private entries. */
  showcase?: ProjectShowcase;
  /** Marks this entry as a component of the named parent: no dossier of its own. */
  parentSlug?: string;
  /** Marks archived work listed under "earlier work" on /projects: no dossier. */
  era?: "earlier";
  /** If true, liveUrl can be iframed on the detail page */
  embeddable?: boolean;
  /** If true, the demo subdomain is offline — show a static preview instead of iframe */
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
  /** On-site showcase only — no GitHub repo (e.g. OpenRouter demos page) */
  siteOnly?: boolean;
  /** Private dossier — shipped vs remaining finish-line (recruiter-facing) */
  finishLine?: string;
}

export interface EnrichedProject extends ProjectConfig {
  repo: GitHubRepo | null;
  lastUpdated: string;
  language: string | null;
  /** All languages from GitHub when API available (percentages omitted client-side) */
  languages: string[];
  stars: number;
  forks: number;
  /** Open issues count from GitHub when token can read the repo */
  openIssuesCount: number;
  /** Combined CI status when checks API available */
  ciStatus: "success" | "failure" | "pending" | "unknown" | null;
  /**
   * Public GitHub URL from curated `private` + repoName.
   * Null for catalog-private rows even if GitHub later reports public.
   */
  githubUrl: string | null;
}
