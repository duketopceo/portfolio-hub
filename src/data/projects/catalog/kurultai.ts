import { defineProject } from "../define";

export const kurultaiProject = defineProject({
  slug: "kurultai",
  repoName: "kurultai",
  displayName: "Kurultai",
  tagline:
    "Local-first SQLite knowledge brain — FTS search, MCP tools, per-source connectors",
  description:
    "Kurultai is a local-first SQLite knowledge brain: a Rust CLI and daemon that indexes notes and docs, searches with FTS5, and exposes knowledge to agents through MCP. Per-source connectors bring heterogeneous stores into one searchable brain, with optional embeddings and an optional Postgres hub behind feature flags.",
  category: "ai",
  type: "platform",
  techStack: ["Rust", "SQLite", "MCP", "Axum", "FTS5"],
  tier: "lead",
  featured: true,
  private: false,
  highlights: [
    "Local-first SQLite store with FTS5 search",
    "Rust CLI and Axum daemon for indexing, search, and status",
    "Per-source connectors for notes, repositories, and documents",
    "Eight MCP tools for agent-native retrieval and knowledge capture",
  ],
  architecture:
    "Source connectors → SQLite + FTS5 → Axum daemon/API → MCP tool surface → Agent consumers",
  engineeringDecisions: [
    "SQLite first — Keeps the daily knowledge loop local, portable, and operational without a hosted dependency",
    "MCP as the agent boundary — Gives multiple agent runtimes one stable retrieval and memory interface",
    "Optional semantic services — Preserves useful FTS-only operation when model APIs are unavailable",
  ],
});
