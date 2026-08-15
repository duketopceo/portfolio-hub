import { defineProject } from "../define";

export const khanProject = defineProject({
  slug: "khan",
  repoName: "Khan",
  displayName: "Khan",
  tagline:
    "Agent Zero fork — plugins, secret-first ops, research harness, multi-agent board",
  description:
    "Khan is a private Agent Zero fork rebuilt around first-class plugins, secret-first operations, research workflows, and shared memory and skills. A live coordination board keeps multiple coding agents aligned across product milestones without copying state between tools.",
  category: "ai",
  type: "platform",
  techStack: ["Python", "Flask", "LiteLLM", "Socket.IO", "Alpine.js"],
  tier: "core",
  featured: true,
  private: true,
  highlights: [
    "Plugin-first architecture with sandboxed execution",
    "Secret-first operations with name-only references",
    "Citation-aware research harness",
    "Live multi-agent coordination board",
  ],
  architecture:
    "Agent Zero core → Khan plugin layer → Research and memory services → Web interface → Multi-agent board",
  engineeringDecisions: [
    "Plugins over core forks — Isolates custom capabilities and reduces upstream merge friction",
    "Name-only secret references — Keeps credentials outside agent-visible project state",
  ],
});
