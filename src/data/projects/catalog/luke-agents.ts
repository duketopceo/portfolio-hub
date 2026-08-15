import { defineProject } from "../define";

export const lukeAgentsProject = defineProject({
  slug: "luke-agents",
  repoName: "luke-agents",
  displayName: "Luke Agents",
  tagline:
    "Shared standards for AI-assisted engineering — principles, guardrails, inheritance",
  description:
    "Luke Agents is the source of truth for agent behavior across active repositories: engineering principles, guardrails, coding and testing standards, and tool guidance. Repositories inherit the shared constitution through thin local pointers and add only project-specific rules.",
  category: "ai",
  type: "library",
  techStack: ["Python", "Markdown", "MCP", "Agent Standards", "Guardrails"],
  tier: "core",
  featured: true,
  private: true,
  highlights: [
    "Single inheritance root for agent behavior",
    "Stable principles with evolving operational guardrails",
    "Repository-local specialization without copy-paste drift",
  ],
  architecture:
    "Shared agent constitution → Repository rule pointers → Runtime-specific guidance → Coding agents",
  engineeringDecisions: [
    "Inheritance over duplication — Prevents standards from silently diverging across repositories",
    "Principles separated from tactics — Lets tooling guidance evolve without weakening core constraints",
  ],
});
