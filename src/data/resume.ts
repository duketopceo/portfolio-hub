// Single source of truth for Luke Kimball's resume / professional data.
// Consumed by:
//   - src/app/resume/page.tsx        (semantic HTML + JSON-LD for crawlers/AI)
//   - src/app/resume.json/route.ts   (JSON Resume output)
//   - src/app/resume.md/route.ts     (plain-markdown output)
//   - scripts/export-resume-pdf.mjs  (renders public/resume.pdf)

export const SITE = "https://luke-the-duke.com";

// ISO date printed on the PDF and shown beside its link.
export const resumeRevisionDate = "2026-10-22";

export const basics = {
  name: "Luke Kimball",
  label: "Software Engineer",
  headline:
    "Multi-Model Agent Harnesses · Sandboxed Runtimes · CLI & OpenRouter Tooling",
  summary:
    "Systems and applied AI engineer maintaining 50+ open-source repositories (github.com/duketopceo) across Rust, Go, TypeScript, and Python, focused on multi-model agent harnesses, CLI workflow runners, masked credential brokering, context compaction, and OpenRouter evaluation tooling. Built laptop-to-cloud agent runtimes (Khan, open-computer), cross-harness CLI adapters (agentflow), and OS keyring isolation (OmaSeal) so sandboxed agents switch models and execute tools without ever seeing raw credentials.",
  // Public contact address is an alias routed through Cloudflare Email
  // Routing (luke-the-duke.com) — never the personal mailbox. No phone:
  // it is unrotatable and this data is explicitly offered to AI crawlers.
  email: "hello@luke-the-duke.com",
  url: SITE,
  location: { city: "Provo", region: "UT", countryCode: "US", remote: true },
  profiles: [
    { network: "LinkedIn", username: "lukekimball2789", url: "https://linkedin.com/in/lukekimball2789" },
    { network: "GitHub", username: "duketopceo", url: "https://github.com/duketopceo" },
    { network: "Portfolio", username: "luke-the-duke.com", url: SITE },
  ],
};

export const skills = [
  {
    name: "Languages & Systems",
    detail:
      "Rust (Tokio, Axum, Serde, SQLite FTS5, sqlite-vec), Go (Chi, OS daemons, D-Bus), TypeScript / Node.js (Hono, Next.js, Drizzle), Python (FastAPI, LangGraph, asyncio), PostgreSQL 17 (RLS, skip-locked queues).",
    keywords: ["Rust", "Tokio", "Axum", "Go", "Chi", "TypeScript", "Node.js", "Hono", "Next.js", "Drizzle", "Python", "FastAPI", "LangGraph", "PostgreSQL 17", "RLS"],
  },
  {
    name: "Agent Harnesses & Routing",
    detail:
      "OpenRouter API & Management Keys, LiteLLM, Temporal & Restate durable workflows, Model Context Protocol (MCP), Claude Code, Codex, OpenCode, Cursor, Devin, Agent Zero, Hermes, Ollama, llama.cpp (Vulkan).",
    keywords: ["OpenRouter", "LiteLLM", "Temporal", "Restate", "MCP", "Claude Code", "Codex", "OpenCode", "Cursor", "Devin", "Agent Zero", "Hermes", "Ollama", "llama.cpp"],
  },
  {
    name: "Sandboxing, Secrets & Quality",
    detail:
      "E2B & CubeSandbox isolated runtimes, Freedesktop Secret Service (gnome-keyring), 1Password CLI, AES-256-GCM vaults, SSRF egress allowlists, Vision E2E testing (Argus), Docker Swarm, GitHub Actions CI.",
    keywords: ["E2B", "CubeSandbox", "gnome-keyring", "1Password", "Vaultwarden", "SSRF", "Argus", "Docker", "GitHub Actions"],
  },
];

export const projects = [
  {
    name: "Khan & OpenRouter Usage Plugin — Agent Harness & Spend Telemetry",
    url: "https://github.com/duketopceo/openrouter_usage",
    caseStudy: "https://github.com/duketopceo/a0-openrouter-spend",
    description:
      "OpenRouter-native fork of Agent Zero with Temporal workflow durability, LiteLLM multi-model worker pools, MCP tool integration, dynamic tool risk scoring, and a one-command PATH CLI plus macOS app wrapper.",
    highlights: [
      "Built openrouter_usage (and a0-openrouter-spend), the published Agent Zero OpenRouter Usage Plugin featuring server-side management-key isolation, workspace-scoped /analytics/query cost attribution, local SQLite usage caching, and confirmation-gated model routing.",
    ],
    stack: ["Python", "OpenRouter", "Temporal", "LiteLLM", "SQLite", "MCP"],
  },
  {
    name: "agentflow & open-computer — Cross-Harness CLI & Sandboxed Cloud Runtime",
    url: "https://github.com/duketopceo/agentflow",
    caseStudy: "https://github.com/duketopceo/open-computer",
    description:
      "Engineered @lukedaduke/agentflow (v0.2.0 on npm), a cross-harness .mjs CLI workflow runner that orchestrates bounded non-interactive sessions across Claude Code, Codex, Cursor, Devin, and OpenCode with disk-journaled state recovery.",
    highlights: [
      "Built open-computer with a benchmarked multi-model router (bench/router/), disposable CubeSandbox execution, a policy and PII approval gate, a portable /skills capability registry across models, and a /automations Temporal scheduler.",
    ],
    stack: ["TypeScript", "Node.js", "Python", "OpenRouter", "Temporal", "CubeSandbox"],
  },
  {
    name: "OmaSeal & a0-plugin-omaseal — OS Keyring & Masked Credential Brokering",
    url: "https://github.com/duketopceo/OmaSeal",
    caseStudy: "https://github.com/duketopceo/a0-plugin-omaseal",
    description:
      "Built a Go desktop keyring engine (v0.4.0) over the Freedesktop Secret Service API and MCP, plus a companion Python secrets resolver across gnome-keyring, 1Password, and AES-256-GCM vaults.",
    highlights: [
      "Substitutes §§secret(NAME) placeholders in-process at tool execution and scrubs resolved values from tool output so sandboxed agents only ever see secret names and masked values.",
    ],
    stack: ["Go", "Python", "gnome-keyring", "1Password", "AES-256-GCM", "MCP"],
  },
  {
    name: "jev-compact & Kurultai — Context Compaction & Hybrid Retrieval Daemon",
    url: "https://github.com/duketopceo/kurultai",
    caseStudy: "https://github.com/duketopceo/jev-compact",
    description:
      "Created jev-compact (and a0-plugin-jev-compact), an agent session-compaction engine that uses a decision model to score transcript spans, keep load-bearing context verbatim, tombstone stale segments, and restore spans on demand over MCP.",
    highlights: [
      "Developed kurultai (v0.7.0, 342 commits) in async Rust to index notes, chat transcripts, and repositories into SQLite with two-hop tag FTS5 expansion, Reciprocal Rank Fusion (RRF) hybrid scoring, and deterministic graph_chain citation provenance over MCP.",
    ],
    stack: ["Rust", "Tokio", "Axum", "Python", "SQLite FTS5", "sqlite-vec", "MCP"],
  },
  {
    name: "orchestral & Argus — Multi-Model Evaluation & Vision E2E Harness",
    url: "https://github.com/duketopceo/orchestral",
    caseStudy: "https://github.com/duketopceo/Argus",
    description:
      "Built orchestral (422 commits, 125 test files) and an E2B-compatible isolated code runtime to evaluate whether low-cost orchestrator and worker model pairs match frontier-model output quality across OpenRouter providers under CI gates.",
    highlights: [
      "Shipped Argus (argus-reviewer-e2e v0.5.0 on npm, 302 commits), a BYOK OpenRouter vision-model E2E testing harness and PR reviewer with fingerprint-cached replay, DOM-verified grounding, hard per-run budget caps, and networkless Docker reproduction; dogfooded across tallyline.",
    ],
    stack: ["Python", "TypeScript", "Playwright", "OpenRouter", "E2B", "Docker", "CI"],
  },
  {
    name: "Pace Server & tallyline — Multi-Tenant Cloud & Agent Dispatch Monorepo",
    url: "https://github.com/duketopceo/tallyline",
    caseStudy: "https://pacehq.io",
    description:
      "Designed Pace's multi-tenant cloud backend (Rust/Axum gateway, Go/Chi services, Postgres 17 RLS, Stripe Connect metering, Stytch B2B SSO) with an 8-step agentrun pipeline behind TierGate autonomy controls and SSRF egress allowlists.",
    highlights: [
      "Built tallyline (v1.0.0), an agent-native issue tracker monorepo with an MCP server, CLI, and single-dependency PostgreSQL skip-locked agent dispatch worker; isolated and reported an upstream wake-queue attribution race in paperclipai/paperclip (#14121).",
    ],
    stack: ["Rust (Axum)", "Go (Chi)", "TypeScript (Hono)", "PostgreSQL 17", "RLS", "MCP"],
  },
  {
    name: "dayflow-linux & portfolio-hub — Linux Desktop Journal & Telemetry",
    url: "https://github.com/duketopceo/dayflow-linux",
    caseStudy: "https://github.com/duketopceo/portfolio-hub",
    description:
      "Ported Dayflow natively to Linux in Go (v1.6.0, 212 commits) with local-first screen capture, OpenRouter vision summarization, standup generation, agent-session recaps, FTS5 search, and MCP tool exposure (including 6 merged external community PRs).",
    highlights: [
      "Built portfolio-hub (luke-the-duke.com) with cached 90-day GitHub App engineering telemetry, machine-readable JSON Resume and llms.txt endpoints, and automated privacy and visual regression gates across 50+ repositories.",
    ],
    stack: ["Go", "TypeScript", "Next.js", "SQLite FTS5", "OpenRouter", "MCP"],
  },
];

export const work = [
  {
    company: "Bartlett Roofing",
    position: "IT Support & Data Specialist",
    startDate: "2025",
    endDate: "Present",
    location: "Murray, UT (UT / ID)",
    summary: "Internal systems, data automation, and multi-state IT infrastructure across Utah and Idaho for a 200-person organization.",
    highlights: [
      "Promoted within 4 months to own internal systems, data automation, and multi-state IT infrastructure across Utah and Idaho for a 200-person commercial and residential roofing organization.",
      "Deployed containerized internal services (Snipe-IT for 105+ assets, MeshCentral, Vaultwarden, Docker, Tailscale) on bare-metal Linux alongside authenticated read/write APIs, Python permit automations, and a Next.js operations dashboard.",
      "Trained the engineering and IT team on daily Claude Code, Cursor, and multi-model OpenRouter workflows in month one.",
    ],
  },
  {
    company: "LiveView Technologies (LVT)",
    position: "Data Intern & Manufacturing IT Liaison",
    startDate: "2024",
    endDate: "2025",
    location: "Orem, UT",
    summary: "Cross-team liaison between engineering and manufacturing.",
    highlights: [
      "Automated production data-pipeline fixes in Python and built executive Tableau dashboards tracking defect rates, assembly throughput, and cycle times across manufacturing and engineering teams.",
    ],
  },
  {
    company: "Vivint Smart Home",
    position: "Inside Sales & Onboarding Trainer",
    startDate: "2020",
    endDate: "2024",
    location: "Provo, UT",
    summary: "Commission sales and technical product onboarding.",
    highlights: [
      "Ranked top 6 in department for 4 consecutive months on commission-only compensation and trained 30+ new hires on technical product workflows.",
    ],
  },
];

export const education = [
  {
    institution: "Mountainland Technical College (MTECH)",
    area: "Data Analytics",
    studyType: "Certificate",
    startDate: "2024",
    endDate: "2025",
  },
  {
    institution: "Brigham Young University-Idaho",
    area: "Computer Engineering & Economics",
    studyType: "Coursework (3 Semesters)",
    startDate: "2018",
    endDate: "2020",
  },
];

export const awards = [
  {
    title: "Eagle Scout",
    date: "2014",
    summary: "Earned Eagle Scout at age 14.",
  },
];

// Machine-readable file catalog advertised to AI crawlers via /llms.txt.
export const aiFiles = [
  { path: "/resume.json", type: "application/json", schema: "JSON Resume", desc: "Full structured resume (basics, skills, projects, work, education)." },
  { path: "/resume.md", type: "text/markdown", schema: "Markdown", desc: "Resume in plain markdown — easiest for LLM ingestion." },
  { path: "/resume.pdf", type: "application/pdf", schema: "PDF", desc: "Print-ready one-page resume." },
  { path: "/llms.txt", type: "text/plain", schema: "llms.txt", desc: "This index — start here." },
  { path: "/sitemap.xml", type: "application/xml", schema: "Sitemap", desc: "All crawlable routes." },
];

