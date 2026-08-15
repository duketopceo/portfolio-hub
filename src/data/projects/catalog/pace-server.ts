import { defineProject } from "../define";

export const paceServerProject = defineProject({
  slug: "pace-server",
  repoName: "Pace-Server",
  displayName: "Pace Server",
  tagline:
    "The private cloud for small businesses — one login, one bill, AI built in",
  description:
    "Pace Server packages identity, billing, AI capabilities, and operator control into a private-cloud product for small businesses. Go services run the core platform while a TypeScript/Vite interface presents a coherent tenant experience.",
  category: "ai",
  type: "platform",
  techStack: ["Go", "TypeScript", "Vite", "Docker", "Multi-tenant"],
  tier: "core",
  featured: true,
  private: true,
  highlights: [
    "Unified identity and billing for small-business operations",
    "AI capabilities built into the product surface",
    "Operator-controlled private-cloud data plane",
  ],
  architecture:
    "Go services → Identity and billing → AI capabilities → TypeScript/Vite UI → Tenant data plane",
  businessContext:
    "Small businesses need cloud productivity without enterprise complexity or opaque SaaS sprawl. Pace turns that requirement into one operable product surface.",
  scopeAndScale:
    "Product-stage, multi-tenant platform designed for small-business operators and service firms.",
  engineeringDecisions: [
    "Go for core services — Keeps the control plane explicit, efficient, and straightforward to operate",
    "Private-cloud packaging — Preserves operator ownership of the data plane while delivering a product UX",
  ],
});
