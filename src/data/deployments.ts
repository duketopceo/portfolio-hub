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
    url: "https://republicatlas.com",
    host: "other",
    role: "Political data platform — election analytics and civic mapping",
    healthCheck: "/",
  },
  {
    slug: "military-hardware-db",
    url: "https://omhdb.luke-the-duke.com/#/",
    subdomain: "omhdb",
    host: "swarm",
    role: "Open military hardware database — 183 platforms across air, land, sea, and munitions",
    healthCheck: "/api/health",
  },
  {
    slug: "alphahedge",
    url: "https://alphahedge.luke-the-duke.com",
    subdomain: "alphahedge",
    host: "swarm",
    role: "Hedge fund simulation with real-time market dynamics and portfolio analytics",
    healthCheck: "/",
  },
  {
    slug: "dixi",
    url: "https://dixi.luke-the-duke.com",
    subdomain: "dixi",
    host: "swarm",
    role: "AI projection system — computer vision, gesture recognition, real-time AI canvas",
    healthCheck: "/",
  },
  {
    slug: "quiz-the-best",
    url: "https://quiz.luke-the-duke.com",
    subdomain: "quiz",
    host: "swarm",
    role: "AI-powered study companion — flashcards, quizzes, and summaries",
    healthCheck: "/",
  },
  {
    slug: "personal-blog",
    url: "https://blog.luke-the-duke.com",
    subdomain: "blog",
    host: "swarm",
    role: "Personal blog platform with AI-assisted content and dark mode",
    healthCheck: "/",
  },
  {
    slug: "collaborative-essay",
    url: "https://essay.luke-the-duke.com",
    subdomain: "essay",
    host: "swarm",
    role: "Collaborative writing platform with PR-based editing and AI assistance",
    healthCheck: "/",
  },
  {
    slug: "ikbr-dashboard",
    url: "https://ibkr.luke-the-duke.com",
    subdomain: "ibkr",
    host: "swarm",
    role: "Interactive Brokers portfolio dashboard with real-time charts",
    healthCheck: "/",
  },
  {
    slug: "skyguard-ai",
    url: "https://skyguard.luke-the-duke.com",
    subdomain: "skyguard",
    host: "swarm",
    role: "SkyGuard AI — roofing operations assistant powered by Gemini",
    healthCheck: "/",
  },
];
