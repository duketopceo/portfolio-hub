// Single source of truth for Luke Kimball's resume / professional data.
// Consumed by:
//   - src/app/resume/page.tsx        (semantic HTML + JSON-LD for crawlers/AI)
//   - src/app/resume.json/route.ts   (JSON Resume output)
//   - src/app/resume.md/route.ts     (plain-markdown output)
// public/resume.pdf is a separately produced static artifact with no generator
// in this repository — update it by hand when this content changes.

export const SITE = "https://luke-the-duke.com";

export const basics = {
  name: "Luke Kimball",
  label: "Applied AI Engineer",
  headline:
    "OpenRouter-Native Multi-Model Routing · Agent Harnesses · Build-Over-Buy Internal Tools",
  summary:
    "OpenRouter-native operator-builder who ships internal agentic tooling instead of buying software built for the masses. Multi-model daily driver: routes frontier models to map a repo, smaller models to decode, large models for implementation, and small models to organize — each task to the cheapest capable model. Forked Agent Zero into a personal, OpenRouter-native harness and designed a tenant-aware agent platform with security and evals built in. Support/GTM fluency from sales, ticketing, CRM, and ops.",
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
    name: "Multi-Model Routing & Cost",
    detail:
      "OpenRouter as primary router. Routes frontier models to map a repo, smaller models to decode, large models for implementation, and small models to organize — each task to the cheapest capable model.",
    keywords: ["OpenRouter", "model routing", "cost optimization", "frontier models"],
  },
  {
    name: "Agent Harnesses",
    detail:
      "Heavy use of Claude Code, Cursor, Agent Zero, Hermes, and Gemini; hands-on with Factory AI, OpenCode, Grok, and Perplexity Computer; forked Agent Zero into \"Khan\" and designed Pace's agentrun pipeline (TierGate, tool registry, approval gates).",
    keywords: ["Claude Code", "Cursor", "Agent Zero", "Hermes", "Gemini", "agentic workflows"],
  },
  {
    name: "Agentic Tooling & LLM Infra",
    detail:
      "Rust/Axum gateway + Go/Chi agent backend + Python/LangGraph reasoning; Supabase Postgres 17 with RLS tenant isolation; Redis Streams event bus; Stripe metering; Stytch B2B SSO.",
    keywords: ["Rust", "Axum", "Go", "Chi", "LangGraph", "Supabase", "Postgres", "RLS", "Redis", "Stripe", "Stytch"],
  },
  {
    name: "Build-Over-Buy Internal Tools",
    detail:
      "Wraps open-source tools (Snipe-IT, MeshCentral, Vaultwarden) into single internal products; built a helpdesk dashboard and web-app pitch decks instead of buying SaaS or making PDFs.",
    keywords: ["Snipe-IT", "MeshCentral", "Vaultwarden", "Next.js", "internal tooling"],
  },
  {
    name: "Security & Blast Radius",
    detail:
      "Outbound allowlist (SSRF prevention), approval gates, RLS isolation, read/write internal APIs gated behind auth, secrets in Vaultwarden.",
    keywords: ["SSRF prevention", "approval gates", "RLS", "secrets management", "auth"],
  },
  {
    name: "Evals & Reliability",
    detail:
      "Owns the unglamorous last 20% — reliability, edge cases, and finishing work: CI gates before merge, incident runbooks, and cross-tenant isolation enforcement (any RLS bypass halts and alerts the operator). Sentry + structlog observability on containerized bare-metal Linux; Stratum ships a 334+ test suite.",
    keywords: ["reliability", "CI gates", "incident runbooks", "RLS", "testing", "Sentry", "structlog", "observability"],
  },
];

export const projects = [
  {
    name: "Pace Server (Pace HQ)",
    url: "https://pacehq.io",
    caseStudy: `${SITE}/projects/pace-server`,
    description:
      "Private-cloud OS for SMBs — wraps open-source tools (chat, vault, e-sign, files) into one product with one login and one bill. Multi-language stack: Rust/Axum gateway, Go/Chi agent backend, scaffolded Python/LangGraph reasoning service, React, Supabase Postgres 17 + RLS.",
    highlights: [
      "Designed the tenant-aware agent system: 8-step agentrun pipeline, TierGate autonomy tiers (1–5), tool registry, audit trail, approval gates, outbound allowlist (SSRF prevention); model routing via OpenRouter.",
      "Platform live (gateway, auth, Stripe billing); real tool execution and Python reasoning service still in progress.",
    ],
    stack: ["Rust", "Axum", "Go", "Chi", "Python", "LangGraph", "React", "Supabase", "Postgres 17", "RLS", "Redis", "Stripe", "Stytch"],
  },
  {
    name: "Khan — Agent Zero fork",
    caseStudy: `${SITE}/projects/khan`,
    description:
      "Private product fork of Agent Zero — a personal Linux-backed agent harness with model/harness freedom. OpenRouter-native, plugin system, multi-agent delegation, secrets management, browser DOM annotation, and Mac app distribution.",
    highlights: [
      "Strategy, design, and governance live in-repo; one-command install ships a PATH CLI plus a Mac app wrapper.",
      "Extended Agent Zero into a workflow-specific harness rather than a config.",
    ],
    stack: ["Agent Zero", "OpenRouter", "plugins", "multi-agent", "Mac app"],
  },
  {
    name: "Kurultai",
    url: "https://github.com/duketopceo/kurultai",
    caseStudy: "https://github.com/duketopceo/kurultai",
    description:
      "Local knowledge brain for agents — indexes notes, chats, repos, and docs into one SQLite store with FTS5 full-text + sqlite-vec vector search, exposed through an MCP server. Rust + SQLite + axum.",
    highlights: [
      "One store for retrieval instead of whole-vault dumps — search/ask/MCP return excerpts with citations, not the full source.",
      "Per-source connectors (notes, repos, docs) feed a single embeddings store; MCP makes it agent-native.",
    ],
    stack: ["Rust", "SQLite", "FTS5", "sqlite-vec", "MCP", "axum"],
  },
  {
    name: "Stratum Engine",
    url: "https://stratumhq.app",
    description:
      "Secondary production voice-agent project — 24/7 Retell agent for contractors (missed-call recovery, follow-ups). FastAPI + Supabase + Fly.io + Stripe; 334+ tests.",
    highlights: [],
    stack: ["FastAPI", "Supabase", "Fly.io", "Stripe", "Retell", "voice AI"],
  },
];

export const work = [
  {
    company: "Bartlett Roofing",
    position: "IT Operations & Infrastructure Lead",
    startDate: "2025",
    endDate: "Present",
    location: "UT / ID",
    summary: "Lead IT across UT + ID for a ~200-person org.",
    highlights: [
      "Promoted to lead IT across UT + ID within 4 months for a ~200-person roofing org.",
      "Containerized services (Snipe-IT, MeshCentral, Vaultwarden) on bare-metal Linux; built a helpdesk dashboard and web-app pitch decks instead of buying SaaS or making PDFs.",
      "Built read/write internal APIs for the IT team, gated behind authentication; Python automations and a Next.js dashboard cut manual follow-up and reporting.",
      "Asked to train the IT team on AI tooling in month one — runs Claude Code, Cursor, and OpenRouter routing daily across the org.",
    ],
  },
  {
    company: "LiveView Technologies",
    position: "Data Intern / Manufacturing IT Liaison",
    startDate: "2024",
    endDate: "2025",
    location: "UT",
    summary: "Cross-team liaison between engineering and production.",
    highlights: [
      "Cross-team liaison coordinating between engineering and production teams; automated data-pipeline fixes in Python.",
      "Built Tableau dashboards for production analytics — defect rates, throughput, and cycle times.",
    ],
  },
  {
    company: "Vivint Smart Home",
    position: "Inside Sales & Trainer",
    startDate: "2020",
    endDate: "2024",
    location: "UT",
    summary: "Commission sales; trained new hires.",
    highlights: [
      "Power-ranked top 6 in department for 4 consecutive months on commission-heavy, no-base comp; trained 30+ new hires.",
    ],
  },
];

export const education = [
  {
    institution: "MTECH Vocational",
    area: "Data Analytics",
    studyType: "Certificate",
    startDate: "2024",
    endDate: "2025",
  },
  {
    institution: "BYU-Idaho",
    area: "Computer Engineering & Economics",
    studyType: "Coursework",
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
