import { defineProject } from "../define";

export const serverClusterProject = defineProject({
  slug: "server-cluster",
  repoName: "Bartlett-server-001",
  displayName: "Bartlett Server-001",
  tagline:
    "Self-hosted operations stack — Cloudflare Access, nginx, Compose, CI, and runbooks",
  description:
    "The main operations repository for a self-hosted Ubuntu server. It owns Docker Compose services, Cloudflare Access routing, nginx configuration, deployment and recovery scripts, security validation, and operator runbooks.",
  category: "infra",
  type: "infra",
  techStack: ["Docker Compose", "Python", "nginx", "Cloudflare Access", "GitHub Actions"],
  tier: "supporting",
  private: true,
  highlights: [
    "Cloudflare Zero Trust routing to selected services",
    "Compose source of truth for the application stack",
    "Deploy, recovery, and health-check automation",
    "CI validation plus secret and image scanning",
  ],
  architecture:
    "Cloudflare Access → Cloudflare Tunnel → nginx → Docker Compose services → Health and recovery automation",
  engineeringDecisions: [
    "Compose as source of truth — Matches a single-server operational footprint without orchestration overhead",
    "Runbooks beside infrastructure — Keeps recovery procedures versioned with the services they operate",
  ],
});
