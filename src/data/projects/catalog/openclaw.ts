import { defineProject } from "../define";

export const openclawProject = defineProject({
  slug: "openclaw",
  repoName: "openclaw-macmini-hardened",
  displayName: "Hardened OpenClaw",
  tagline:
    "Security-focused local agent deployment with controlled model routing and reviewed memory",
  description:
    "A hardened OpenClaw deployment for Apple Silicon that combines container isolation, private remote access, local and routed models, a memory review queue, and audit logs into an operable agent host.",
  category: "ai",
  type: "platform",
  techStack: ["Python", "Docker", "Tailscale", "Ollama", "LiteLLM"],
  private: true,
  highlights: [
    "Containerized agent runtime",
    "Private administrative access",
    "Local Ollama and cost-aware LiteLLM routing",
    "Reviewed memory queue and audit trail",
  ],
  architecture:
    "Private access → Docker-isolated OpenClaw → Ollama/LiteLLM routing → Memory review queue → Audit logs",
  engineeringDecisions: [
    "Review before durable memory — Prevents untrusted agent output from silently becoming long-lived context",
    "Local-first model path — Preserves useful operation and privacy while allowing controlled API fallback",
  ],
});
