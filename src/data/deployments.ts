import type { ProjectConfig } from "@/lib/types";

/**
 * Production URLs and hosting targets per curated project.
 *
 * Railway is the current portfolio-hub deploy target; Swarm entries are legacy.
 * Multiple rows may share a slug (e.g. Pace prod + observe + status).
 *
 * `online: false` → not counted as live; UI stays honest when unknown/offline.
 */

export type DeploymentHost =
  | "railway"
  | "cloudflare"
  | "hetzner"
  | "swarm"
  | "vercel"
  | "firebase"
  | "other";

export interface DeploymentConfig {
  /** Project slug (must match projectConfigs, or `portfolio-hub` for this site) */
  slug: string;
  /** Full live URL */
  url: string;
  /** Subdomain when applicable */
  subdomain?: string;
  /** Hosting / edge target */
  host: DeploymentHost;
  /** Brief role label for the services table */
  role: string;
  /** Optional health check path (relative to url origin) */
  healthCheck?: string;
  /** Whether this endpoint is expected to answer today */
  online: boolean;
}

export const deployments: DeploymentConfig[] = [
  // ── Lead systems (Aug 2026) ─────────────────────────────────────
  {
    slug: "khan",
    url: "https://khanai.app",
    host: "railway",
    role: "Khan public app surface",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "khan",
    url: "https://khanai.app",
    host: "cloudflare",
    role: "Edge / DNS for khanai.app",
    online: true,
  },
  {
    slug: "kurultai",
    url: "https://github.com/duketopceo/kurultai",
    host: "other",
    role: "Public source — local knowledge brain",
    online: true,
  },
  {
    slug: "pace-server",
    url: "https://pacehq.io",
    host: "cloudflare",
    role: "Pace marketing / product home",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "pace-server",
    url: "https://app.pacehq.io",
    host: "railway",
    role: "Pace application",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "pace-server",
    url: "https://observe.pacehq.io",
    host: "hetzner",
    role: "Grafana observability (as-code)",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "pace-server",
    url: "https://status.pacehq.io",
    host: "hetzner",
    role: "Status page",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "openrouter",
    url: "/openrouter",
    host: "railway",
    role: "OpenRouter demos showcase — Deflect, Motion, Bakeoff (this site)",
    online: true,
  },
  {
    slug: "openrouter",
    url: "https://github.com/duketopceo/openrouter-demos",
    host: "other",
    role: "Public source — deflect/, motion/, bakeoff/",
    online: true,
  },
  {
    slug: "stratum-hq",
    url: "https://stratumhq.app",
    host: "other",
    role: "Stratum Engine product shell",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "portfolio-hub",
    url: "https://luke-the-duke.com",
    host: "railway",
    role: "Cosmic Intelligence portfolio (this repo) — public via tunnel until Railway DNS",
    healthCheck: "/api/health",
    online: false,
  },
  // ── Other live / catalog deployments ────────────────────────────
  {
    slug: "military-hardware-db",
    url: "https://omhdb.luke-the-duke.com/#/",
    subdomain: "omhdb",
    host: "swarm",
    role: "Open military hardware database",
    healthCheck: "/api/health",
    online: true,
  },
  {
    slug: "republic-atlas",
    url: "https://republicatlas.com",
    host: "other",
    role: "Political data platform",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "nanoclaw",
    url: "https://nanoclaw.dev",
    host: "other",
    role: "Multi-channel agentic AI container",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "chronicle-weaver",
    url: "https://chronicleweaver.com",
    host: "other",
    role: "Interactive narrative platform",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "finance-frenzy",
    url: "https://devpost.com/software/finance-frenzy/",
    host: "other",
    role: "Hackathon finance simulation — Devpost",
    online: true,
  },
  // ── Legacy Swarm subdomains (offline) ───────────────────────────
  {
    slug: "alphahedge",
    url: "https://alphahedge.luke-the-duke.com",
    subdomain: "alphahedge",
    host: "swarm",
    role: "Hedge fund simulation",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "dixi",
    url: "https://dixi.luke-the-duke.com",
    subdomain: "dixi",
    host: "swarm",
    role: "AI projection system",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "quiz-the-best",
    url: "https://quiz.luke-the-duke.com",
    subdomain: "quiz",
    host: "swarm",
    role: "AI study companion",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "personal-blog",
    url: "https://blog.luke-the-duke.com",
    subdomain: "blog",
    host: "swarm",
    role: "Technical blog",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "collaborative-essay",
    url: "https://essay.luke-the-duke.com",
    subdomain: "essay",
    host: "swarm",
    role: "Collaborative writing",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "ikbr-dashboard",
    url: "https://ibkr.luke-the-duke.com",
    subdomain: "ibkr",
    host: "swarm",
    role: "IBKR portfolio dashboard",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "skyguard-ai",
    url: "https://skyguard.luke-the-duke.com",
    subdomain: "skyguard",
    host: "swarm",
    role: "Roofing operations assistant",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "series65-study-app",
    url: "https://study.luke-the-duke.com",
    subdomain: "study",
    host: "swarm",
    role: "Series 65 study platform",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "curious-storycard",
    url: "https://curious.luke-the-duke.com",
    subdomain: "curious",
    host: "swarm",
    role: "Curious — swipeable knowledge cards",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "nem-stock-pitch",
    url: "https://nem.luke-the-duke.com",
    subdomain: "nem",
    host: "swarm",
    role: "NEM stock pitch",
    healthCheck: "/",
    online: false,
  },
];

export function getDeploymentsBySlug(slug: string): DeploymentConfig[] {
  return deployments.filter((d) => d.slug === slug);
}

/** @deprecated Prefer getDeploymentsBySlug — returns first row for a slug */
export function getDeploymentBySlug(
  slug: string
): DeploymentConfig | undefined {
  return getDeploymentsBySlug(slug)[0];
}

/** Primary deployment for liveUrl overlay (first online, else first row). */
export function getPrimaryDeployment(
  slug: string
): DeploymentConfig | undefined {
  const rows = getDeploymentsBySlug(slug);
  return rows.find((d) => d.online) ?? rows[0];
}
