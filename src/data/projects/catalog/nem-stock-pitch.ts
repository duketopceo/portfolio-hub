import { defineProject } from "../define";

export const nemStockPitchProject = defineProject({
  slug: "nem-stock-pitch",
  repoName: "nem-stock-pitch",
  displayName: "NEM Stock Pitch",
  tagline:
    "Interactive equity research on Newmont as a monetary, copper, and infrastructure thesis",
  description:
    "An interactive long-form equity research presentation built for a stock-pitch competition. It connects monetary conditions, central-bank gold demand, copper exposure, mining energy requirements, and AI infrastructure demand through responsive charts and maps.",
  category: "finance",
  type: "app",
  techStack: ["HTML", "CSS", "Chart.js", "MapLibre", "Research"],
  status: "showcase",
  private: true,
  demoOffline: true,
  highlights: [
    "Multi-angle investment thesis rather than a single commodity narrative",
    "Interactive chart and geographic storytelling",
    "Peer comparisons and scenario sensitivity analysis",
    "Competition-focused single-page presentation",
  ],
  architecture:
    "Research sources → Thesis model → Chart.js analysis → MapLibre geography → Responsive presentation",
  engineeringDecisions: [
    "Narrative-first visualization — Keeps every chart tied to an explicit investment claim",
    "Static single-page delivery — Makes a dense research artifact portable and presentation-ready",
  ],
});
