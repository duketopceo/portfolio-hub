/**
 * Subdomain + Live Deployment Configuration
 *
 * Maps project slugs to their live deployment URLs and subdomain routing.
 * Update this file when you deploy a new app to your Swarm or external host.
 *
 * The portfolio site reads this at build time to show "Live" badges
 * and link to running instances.
 */

export interface DeploymentConfig {
  /** Project slug (must match projectConfigs) */
  slug: string;
  /** Full live URL */
  url: string;
  /** Subdomain (e.g., "atlas" → atlas.yourdomain.com) */
  subdomain?: string;
  /** Deployment target */
  host: "swarm" | "vercel" | "cloudflare" | "firebase" | "railway" | "other";
  /** Brief role description */
  role: string;
  /** Health check endpoint (relative) */
  healthCheck?: string;
}

export const deployments: DeploymentConfig[] = [
  {
    slug: "republic-atlas",
    url: "https://republic-atlas.web.app/elections?state=IL",
    subdomain: "atlas",
    host: "firebase",
    role: "Political data platform — election analytics and civic mapping",
    healthCheck: "/",
  },
  // ── Add your Swarm deployments below ─────────────────────
  // {
  //   slug: "bartlett-bot",
  //   url: "https://skyguard.yourdomain.com",
  //   subdomain: "skyguard",
  //   host: "swarm",
  //   role: "SkyGuard AI — Bartlett roofing assistant",
  //   healthCheck: "/health",
  // },
  // {
  //   slug: "military-hardware-db",
  //   url: "https://osint.yourdomain.com",
  //   subdomain: "osint",
  //   host: "swarm",
  //   role: "Open military hardware database and search",
  //   healthCheck: "/api/health",
  // },
  // {
  //   slug: "trading-bot",
  //   url: "https://trading.yourdomain.com",
  //   subdomain: "trading",
  //   host: "swarm",
  //   role: "Trading bot dashboard and monitoring",
  //   healthCheck: "/health",
  // },
];

/**
 * DNS records you'd need in Cloudflare for the subdomain plan:
 *
 * Type  | Name             | Content              | Proxy
 * ──────┼──────────────────┼──────────────────────┼───────
 * A     | portfolio        | <swarm-ip>           | Yes
 * A     | atlas            | <swarm-ip>           | Yes
 * A     | osint            | <swarm-ip>           | Yes
 * A     | skyguard         | <swarm-ip>           | Yes
 * A     | trading          | <swarm-ip>           | Yes
 * A     | apps             | <swarm-ip>           | Yes
 * CNAME | *.yourdomain.com | <swarm-ip>           | Yes  (wildcard, optional)
 *
 * Each service in Docker Swarm gets a Traefik label:
 *   traefik.http.routers.<service>.rule=Host(`<subdomain>.yourdomain.com`)
 */
