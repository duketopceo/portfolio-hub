import { defineProject } from "../define";

export const stratumHqProject = defineProject({
  slug: "stratum-hq",
  repoName: "stratumhq",
  displayName: "Stratum",
  tagline: "Product home for the Stratum application family and roadmap",
  description:
    "Stratum is the umbrella product surface for a related application and infrastructure roadmap. This entry preserves the live product shell as an external showcase while keeping repository availability conservative.",
  category: "apps",
  type: "platform",
  techStack: ["TypeScript", "Next.js", "React", "Docker"],
  status: "showcase",
  private: true,
  liveUrl: "https://stratumhq.app",
  demoUrl: "https://stratumhq.app",
  embeddable: false,
  highlights: [
    "Live product and roadmap shell",
    "Shared surface for related applications",
    "Deployment-aware portfolio integration",
  ],
  architecture:
    "Product roadmap → Next.js application shell → Container delivery → External product domain",
});
