import type { ProjectCategory, ProjectConfig } from "@/lib/types";
import { kurultaiProject } from "./catalog/kurultai";
import { khanProject } from "./catalog/khan";
import { paceServerProject } from "./catalog/pace-server";
import { lukeAgentsProject } from "./catalog/luke-agents";
import { portfolioHubProject } from "./catalog/portfolio-hub";
import { homelabProject } from "./catalog/homelab";
import { bartlettPermitsProject } from "./catalog/bartlett-permits";
import { bartlettDataPlatformProject } from "./catalog/bartlett-data-platform";
import { lukeTheDukeShowProject } from "./catalog/luke-the-duke-show";
import { serverClusterProject } from "./catalog/server-cluster";
import { openclawProject } from "./catalog/openclaw";
import { financeFrenzyProject } from "./catalog/finance-frenzy";
import { nemStockPitchProject } from "./catalog/nem-stock-pitch";
import { republicAtlasProject } from "./catalog/republic-atlas";
import { nanoclawProject } from "./catalog/nanoclaw";
import { stratumHqProject } from "./catalog/stratum-hq";
import { personalBlogProject } from "./catalog/personal-blog";
import { gpuHostingProject } from "./catalog/gpu-hosting";

/** Curated portfolio order. Kurultai is intentionally the lead entry. */
export const projectConfigs: ProjectConfig[] = [
  kurultaiProject,
  khanProject,
  paceServerProject,
  lukeAgentsProject,
  portfolioHubProject,
  homelabProject,
  bartlettPermitsProject,
  bartlettDataPlatformProject,
  lukeTheDukeShowProject,
  serverClusterProject,
  openclawProject,
  financeFrenzyProject,
  nemStockPitchProject,
  republicAtlasProject,
  nanoclawProject,
  stratumHqProject,
  personalBlogProject,
  gpuHostingProject,
];

export const categoryMeta: Record<
  ProjectCategory,
  { label: string; description: string; icon: string }
> = {
  finance: {
    label: "Finance & Trading",
    description: "Financial research, simulation, and market education",
    icon: "chart",
  },
  ai: {
    label: "AI & Automation",
    description: "Agent systems, knowledge infrastructure, and automation",
    icon: "cpu",
  },
  osint: {
    label: "OSINT & Data",
    description: "Open-source intelligence, civic data, and mapping",
    icon: "search",
  },
  data: {
    label: "Data Engineering",
    description: "Ingestion, modeling, orchestration, and analytics",
    icon: "database",
  },
  infra: {
    label: "Infrastructure",
    description: "Self-hosting, networking, security, and deployment",
    icon: "server",
  },
  apps: {
    label: "Apps & Web",
    description: "Full-stack products, publishing, and media experiences",
    icon: "globe",
  },
};

export { defineProject } from "./define";
export type {
  ProjectDefinition,
  ProjectStatus,
  ProjectTier,
} from "./define";
