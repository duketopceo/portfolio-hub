import { defineProject } from "../define";

export const bartlettDataPlatformProject = defineProject({
  slug: "bartlett-data-platform",
  repoName: "bartlett-data-platform",
  displayName: "Bartlett Data Platform",
  tagline:
    "Agentic data platform — ingestion, analytical marts, BI, and predictive operations",
  description:
    "A self-hosted data platform that ingests roofing operations data, models it into governed analytical marts, serves BI dashboards, and prepares predictive workflows such as reinspection-risk scoring.",
  category: "data",
  type: "platform",
  techStack: ["Python", "Airbyte", "PostgreSQL", "dbt", "Dagster", "Superset"],
  tier: "core",
  featured: true,
  private: true,
  highlights: [
    "Layered ingestion, staging, marts, and metrics",
    "Dagster asset orchestration and dbt validation",
    "Self-hosted Superset business intelligence",
    "Data contracts for source schema governance",
  ],
  architecture:
    "Roofing operations data → Airbyte → PostgreSQL → dbt marts → Dagster orchestration → Superset BI",
  businessContext:
    "Operational reporting and prediction require reliable, documented data products rather than spreadsheet handoffs.",
  engineeringDecisions: [
    "Layered analytical models — Separates raw source drift from stable business-facing marts",
    "Open self-hosted stack — Keeps operational data controlled while using mature data-platform components",
  ],
});
