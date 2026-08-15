import { defineProject } from "../define";

export const gpuHostingProject = defineProject({
  slug: "gpu-hosting",
  repoName: "gpu-hosting",
  displayName: "GPU Hosting",
  tagline:
    "Hardware, marketplace, and operating research for small-scale GPU hosting",
  description:
    "An infrastructure research repository for mapping available hardware, comparing marketplace pricing, and planning a multi-platform GPU hosting strategy. It separates time-stamped market snapshots from longer-lived hardware and operations plans.",
  category: "infra",
  type: "experiment",
  techStack: ["GPU Infrastructure", "Vast.ai", "Hardware Planning", "Operations Research"],
  private: true,
  highlights: [
    "Hardware inventory and expansion planning",
    "Time-stamped marketplace pricing comparisons",
    "Multi-platform listing strategy",
    "Operational playbooks designed to evolve with deployed hosts",
  ],
  architecture:
    "Hardware inventory → Marketplace research → Pricing model → Host rollout plan → Operating playbooks",
  engineeringDecisions: [
    "Snapshot market data with dates — Prevents temporary marketplace prices from becoming evergreen assumptions",
  ],
});
