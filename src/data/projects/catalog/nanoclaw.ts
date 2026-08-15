import { defineProject } from "../define";

export const nanoclawProject = defineProject({
  slug: "nanoclaw",
  repoName: "nanoclaw",
  displayName: "NanoClaw",
  tagline:
    "Tenant-scoped agent execution harness with policy, schema, and autonomy gates",
  description:
    "NanoClaw is the Go execution engine behind Pace HQ droids. A triple-locked pipeline injects tenant context, restricts each persona to an allowlisted tool set, validates model output against Go schemas, and applies human approval gates by autonomy tier.",
  category: "ai",
  type: "platform",
  techStack: ["Go", "JSON Schema", "Policy Engine", "Multi-tenant", "Agent Runtime"],
  private: true,
  liveUrl: "https://nanoclaw.dev",
  demoUrl: "https://nanoclaw.dev",
  embeddable: false,
  highlights: [
    "Tenant-safe context silo injection",
    "Per-persona tool allowlists",
    "Schema validation against Go types",
    "Human-in-the-loop autonomy tier gate",
  ],
  architecture:
    "Tenant context + policy → Tool allowlist → LLM execution → JSON schema guard → Autonomy tier gate",
  engineeringDecisions: [
    "Triple-lock enforcement — Makes tenant scope, tool permission, and output shape independent controls",
    "Typed schema guard — Converts model output from suggestion into validated application input",
  ],
});
