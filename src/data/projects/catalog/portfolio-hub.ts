import { defineProject } from "../define";

export const portfolioHubProject = defineProject({
  slug: "portfolio-hub",
  repoName: "portfolio-hub",
  displayName: "Cosmic Intelligence",
  tagline:
    "A repository-backed portfolio with a Cosmic orbit, live metadata, and technical dossiers",
  description:
    "Cosmic Intelligence is the portfolio system itself. Curated project definitions are enriched with GitHub and deployment metadata, then rendered as a recruiter-friendly Cosmic catalog with orbit navigation and technical project dossiers.",
  category: "apps",
  type: "app",
  techStack: ["TypeScript", "Next.js", "React", "Tailwind", "GitHub API"],
  tier: "core",
  featured: true,
  private: true,
  highlights: [
    "Curated catalog enriched with repository activity",
    "Cosmic orbit navigation without sacrificing readable project pages",
    "Deployment-aware live and offline demo states",
    "Technical dossiers that foreground architecture and decisions",
  ],
  architecture:
    "Modular catalog → GitHub and deployment enrichment → Next.js server rendering → Cosmic catalog → Project dossiers",
  engineeringDecisions: [
    "Curated data plus live enrichment — Keeps the narrative intentional while repository facts stay current",
    "Server-side GitHub access — Avoids exposing repository credentials or raw private metadata to clients",
  ],
});
