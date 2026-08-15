/**
 * Subdomain + Live Deployment Configuration
 *
 * Single source of truth for live URLs and subdomain routing.
 * Merged onto projectConfigs in getEnrichedProjects().
 *
 * Public edge: Cloudflare DNS for `*.luke-the-duke.com` (proxied anycast).
 * Origin: Tailscale Docker Swarm — cluster1 historically the manager;
 * cluster2 / cluster3 are workers. Tunnel token lives in homelab
 * `stacks/cloudflare` (never commit). Audit with `scripts/audit-cloudflare.sh`.
 *
 * `online: false` → demoOffline (still listed, not counted as "live").
 * Update this file when Swarm / external hosts change. Do not invent live URLs.
 */

export interface DeploymentConfig {
  /** Project slug (must match projectConfigs) */
  slug: string;
  /** Full live URL */
  url: string;
  /** Subdomain (e.g., "blog" → blog.luke-the-duke.com) */
  subdomain?: string;
  /** Deployment target */
  host: "swarm" | "vercel" | "cloudflare" | "firebase" | "railway" | "other";
  /** Brief role description */
  role: string;
  /** Health check endpoint (relative) */
  healthCheck?: string;
  /** false → treat as demoOffline in the portfolio UI. */
  online: boolean;
}

export const deployments: DeploymentConfig[] = [
  {
    slug: "republic-atlas",
    url: "https://republicatlas.com",
    host: "other",
    role: "Civic data platform — election visualization and voter tools",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "nanoclaw",
    url: "https://nanoclaw.dev",
    host: "other",
    role: "Tenant-scoped agent execution harness",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "stratum-hq",
    url: "https://stratumhq.app",
    host: "other",
    role: "Stratum product shell and roadmap",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "finance-frenzy",
    url: "https://devpost.com/software/finance-frenzy/",
    host: "other",
    role: "Award-winning financial literacy simulation showcase",
    online: true,
  },
  // ── Swarm subdomains currently offline ──────────────────────────
  {
    slug: "personal-blog",
    url: "https://blog.luke-the-duke.com",
    subdomain: "blog",
    host: "swarm",
    role: "Technical publishing platform",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "nem-stock-pitch",
    url: "https://nem.luke-the-duke.com",
    subdomain: "nem",
    host: "swarm",
    role: "Interactive NEM equity research presentation",
    healthCheck: "/",
    online: false,
  },
];

export function getDeploymentBySlug(
  slug: string
): DeploymentConfig | undefined {
  return deployments.find((deployment) => deployment.slug === slug);
}
