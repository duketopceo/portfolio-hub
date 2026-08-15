import { defineProject } from "../define";

export const bartlettPermitsProject = defineProject({
  slug: "bartlett-permits",
  repoName: "bartlett-permits",
  displayName: "Bartlett Permits",
  tagline:
    "Multi-state permit operations — map visibility, SOP cockpit, and automation sidecar",
  description:
    "A permit operations platform for roofing teams across multiple states. It combines a MapLibre dashboard, an SOP-first operator cockpit, CSV and RoofLink ingestion, extraction services, automation dry-runs, and workflow alerts.",
  category: "apps",
  type: "platform",
  techStack: ["TypeScript", "React", "Express", "FastAPI", "PostgreSQL", "MapLibre"],
  tier: "core",
  featured: true,
  private: true,
  highlights: [
    "Multi-state permit and scheduling visibility",
    "SOP-aligned operator cockpit for permit stages",
    "CSV and RoofLink ingestion with extraction sidecar",
    "Automation dry-runs, freshness checks, and workflow alerts",
  ],
  architecture:
    "Operational sources → FastAPI ingestion sidecar → PostgreSQL → Express API → React + MapLibre cockpit",
  businessContext:
    "Permit coordinators need one workflow surface across jurisdictions, inspections, schedules, and source-system data.",
  engineeringDecisions: [
    "SOP-first interface — Maps software states to the team's actual operating process",
    "Separate automation sidecar — Isolates ingestion and extraction work from the interactive application",
  ],
});
