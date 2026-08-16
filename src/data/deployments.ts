/**
 * Subdomain + Live Deployment Configuration
 *
 * Single source of truth for live URLs and subdomain routing.
 * Merged onto projectConfigs in getEnrichedProjects().
 *
 * `online: false` → demoOffline (still listed, not counted as "live").
 * Update this file when Swarm / external hosts change.
 */

export interface DeploymentConfig {
  /** Project slug (must match projectConfigs) */
  slug: string;
  /** Full live URL */
  url: string;
  /** Subdomain (e.g., "omhdb" → omhdb.luke-the-duke.com) */
  subdomain?: string;
  /** Deployment target */
  host: "swarm" | "vercel" | "cloudflare" | "firebase" | "railway" | "other";
  /** Brief role description */
  role: string;
  /** Health check endpoint (relative) */
  healthCheck?: string;
  /**
   * Whether the deployment currently answers.
   * false → treat as demoOffline in the portfolio UI.
   */
  online: boolean;
}

export const deployments: DeploymentConfig[] = [
  {
    slug: "military-hardware-db",
    url: "https://omhdb.luke-the-duke.com/#/",
    subdomain: "omhdb",
    host: "swarm",
    role: "Open military hardware database — 183 platforms across air, land, sea, and munitions",
    healthCheck: "/api/health",
    online: true,
  },
  {
    slug: "republic-atlas",
    url: "https://republicatlas.com",
    host: "other",
    role: "Political data platform — election analytics and civic mapping",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "nanoclaw",
    url: "https://nanoclaw.dev",
    host: "other",
    role: "Lightweight multi-channel agentic AI container",
    healthCheck: "/",
    online: true,
  },
  {
    slug: "stratum-hq",
    url: "https://stratumhq.app",
    host: "other",
    role: "Stratum product shell and roadmap",
    healthCheck: "/",
    online: false,
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
    role: "Hackathon finance simulation — Devpost write-up",
    online: true,
  },
  // ── Swarm subdomains currently offline ──────────────────────────
  {
    slug: "alphahedge",
    url: "https://alphahedge.luke-the-duke.com",
    subdomain: "alphahedge",
    host: "swarm",
    role: "Hedge fund simulation with real-time market dynamics and portfolio analytics",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "dixi",
    url: "https://dixi.luke-the-duke.com",
    subdomain: "dixi",
    host: "swarm",
    role: "AI projection system — computer vision, gesture recognition, real-time AI canvas",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "quiz-the-best",
    url: "https://quiz.luke-the-duke.com",
    subdomain: "quiz",
    host: "swarm",
    role: "AI-powered study companion — flashcards, quizzes, and summaries",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "personal-blog",
    url: "https://blog.luke-the-duke.com",
    subdomain: "blog",
    host: "swarm",
    role: "Personal blog platform with AI-assisted content and dark mode",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "collaborative-essay",
    url: "https://essay.luke-the-duke.com",
    subdomain: "essay",
    host: "swarm",
    role: "Collaborative writing platform with PR-based editing and AI assistance",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "ikbr-dashboard",
    url: "https://ibkr.luke-the-duke.com",
    subdomain: "ibkr",
    host: "swarm",
    role: "Interactive Brokers portfolio dashboard with real-time charts",
    healthCheck: "/",
    online: false,
  },
  {
    slug: "skyguard-ai",
    url: "https://skyguard.luke-the-duke.com",
    subdomain: "skyguard",
    host: "swarm",
    role: "SkyGuard AI — roofing operations assistant powered by Gemini",
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
    role: "NEM stock pitch — Perplexity Computer competition",
    healthCheck: "/",
    online: false,
  },
];

export function getDeploymentBySlug(
  slug: string
): DeploymentConfig | undefined {
  return deployments.find((d) => d.slug === slug);
}
