import { ProjectConfig } from "@/lib/types";
import { projectExtensionConfigs } from "./projects-ext";

export const OPENROUTER_DEMO_VIDEO_URL =
  "https://pub-9e45e5f7be6f4c9989852b4989e83a23.r2.dev/demos/openrouter-demos-walkthrough.mp4";

/**
 * Master project configuration — curated for recruiter/professional viewing.
 * SECURITY: No personal emails, no GitHub usernames, no internal details.
 */
export const projectConfigs: ProjectConfig[] = [
  // ── Lead systems ─────────────────────────────────────────────────
  {
    slug: "khan",
    repoName: "Khan",
    displayName: "Khan",
    tagline:
      "OpenRouter-native Agent Zero fork — Temporal, LiteLLM workers, risk scoring, MCP, Rust CLI",
    description:
      "Khan is a real agent harness built in a concentrated Aug 7–13 sprint: Temporal orchestration, OpenRouter-backed routing, LiteLLM workers, risk scoring, MCP tool surfaces, and a Rust CLI. Ships alongside khanai.app as the public face of the stack. Plugin-first, secret-first operations with a multi-agent coordination board — not a self-hosted GPU or local inference cluster.",
    category: "ai",
    type: "platform",
    featured: true,
    planetVisual: {
      size: "xl",
      shape: "sphere",
      color: "#A78BFA",
      rings: [
        { opacity: 0.38, tilt: -22 },
        { opacity: 0.22, tilt: 28 },
      ],
      moons: [
        { label: "Temporal", kind: "stack" },
        { label: "MCP", kind: "stack" },
        { label: "khanai", kind: "live", href: "https://khanai.app" },
      ],
    },
    techStack: [
      "Python",
      "Temporal",
      "OpenRouter",
      "LiteLLM",
      "MCP",
      "Rust CLI",
    ],
    private: true,
    highlights: [
      "Temporal + OpenRouter orchestration with LiteLLM workers",
      "Risk scoring and MCP tool surfaces for agent workflows",
      "Rust CLI for operator tasks",
      "Public surface at khanai.app",
    ],
    architecture:
      "Temporal workflows → OpenRouter/LiteLLM workers → Risk scoring → MCP tools → Rust CLI + khanai.app",
    finishLine:
      "Shipped Aug 7–13: Temporal + OpenRouter routing, LiteLLM workers, risk scoring, MCP surfaces, Rust CLI, and khanai.app. Remaining polish: harden eval fixtures for production guardrails and expand connector coverage — not a greenfield rebuild.",
  },
  {
    slug: "kurultai",
    repoName: "kurultai",
    displayName: "Kurultai",
    tagline:
      "Rust knowledge brain — MCP retrieval, Vite/React 3D graph, OpenRouter Kimi swarm",
    description:
      "Kurultai is a Rust + axum knowledge layer with MCP tools, SQLite storage (FTS5, sqlite-vec; sqlCipher/lock patterns where evidenced — not PostgreSQL), and a Vite/React 3D brain visualizing 2000+ nodes. OpenRouter Kimi swarm handles multi-agent retrieval. Built for open, showcasable knowledge infrastructure — heterogeneous sources through connectors, agent-native retrieval without another siloed RAG stack.",
    category: "ai",
    type: "platform",
    featured: true,
    planetVisual: {
      size: "xl",
      shape: "hex",
      color: "#A78BFA",
      rings: [{ opacity: 0.32, tilt: -15 }],
      moons: [
        { label: "MCP", kind: "stack" },
        { label: "SQLite", kind: "stack" },
        { label: "OpenRouter", kind: "stack" },
      ],
    },
    techStack: [
      "Rust",
      "SQLite",
      "axum",
      "FTS5",
      "sqlite-vec",
      "MCP",
      "Vite",
      "React",
      "OpenRouter",
    ],
    private: false,
    highlights: [
      "Rust + axum API with MCP tool surface",
      "SQLite FTS5 + sqlite-vec — no Postgres dependency",
      "Vite/React 3D brain over 2000+ knowledge nodes",
      "OpenRouter Kimi swarm for multi-agent retrieval",
    ],
    architecture:
      "Source connectors → SQLite (FTS5 + sqlite-vec) → axum API → MCP tools → Vite/React 3D brain + OpenRouter swarm",
  },
  {
    slug: "argus",
    repoName: "Argus",
    displayName: "Argus",
    tagline:
      "Vision-model E2E testing — record once, fingerprint-cache every step, heal on drift, cost-metered per run",
    description:
      "Argus is an open-source, self-hosted vision-model E2E harness — the open TestDriver alternative. Record a flow once, replay near-free on fingerprint cache, heal only on UI drift, and report results as a check + comment on the GitHub PR. Every vision call is metered from OpenRouter per-call cost into a per-run dollar figure. A grounding specialist model can drive element location verified against the DOM, and an opt-in sandbox lane reproduces code-review findings in a hardened network-less container — a finding that fails on head and passes on base is stamped reproduced.",
    category: "ai",
    type: "library",
    featured: false,
    orbitTier: "secondary",
    demoUrl: "/demos/argus",
    techStack: [
      "TypeScript",
      "Playwright",
      "OpenRouter",
      "GitHub Actions",
      "Docker",
    ],
    private: false,
    highlights: [
      "Cache-first replay — zero vision calls on unchanged UI",
      "Cost-explicit — per-run dollar figure on the PR report",
      "Heal-on-drift with reviewable cache diffs",
      "Sandbox lane reproduces review findings, stamped not suspected",
      "Published npm package argus-reviewer-e2e",
    ],
    architecture:
      "Record (Playwright + vision model) → fingerprint cache → replay/heal → GitHub check + PR comment with per-call cost ledger",
    businessContext:
      "Selector-based E2E is brittle and vision E2E is expensive. Argus makes vision testing cost-predictable: cache hits are free, heals are reviewable, and every run carries an exact dollar figure.",
    scopeAndScale:
      "Published npm package (argus-reviewer-e2e), GitHub Action runner, self-hosted. BYOK via OPENROUTER_API_KEY with hard budget caps.",
    engineeringDecisions: [
      "Fingerprint cache over re-invocation — Vision calls only on drift, not every run",
      "DOM-verified grounding — Model coordinate output checked against the DOM before any click",
      "Cost ledger first-class — Per-call OpenRouter pricing rolled into the run report",
    ],
  },
  {
    slug: "dayflow-linux",
    repoName: "dayflow-linux",
    displayName: "Dayflow",
    tagline:
      "Private automatic work journal for Linux — screenshot sampling, dedupe, vision-model summaries into a readable timeline",
    description:
      "Dayflow for Omarchy/Wayland is a local-first port of the macOS Dayflow app: a single static Go binary samples a frame every 10 seconds, deduplicates unchanged shots, and every 15 minutes sends the block to a vision model (Gemma 4 via OpenRouter by default) for a plain-language summary. The result is a readable timeline in a QML panel — Today, Standup, Chat, Week, and Settings views — with per-app ignore lists, pause controls, retention pruning, inline edits, and journal chat. Frames and the SQLite store stay in ~/.local/share/dayflow.",
    category: "apps",
    type: "app",
    featured: false,
    orbitTier: "secondary",
    demoUrl: "/demos/dayflow",
    techStack: ["Go", "QML", "SQLite", "OpenRouter", "Wayland"],
    private: false,
    highlights: [
      "Local-first — frames and DB never leave ~/.local/share/dayflow",
      "Cheap by design — ~30 frames per block to a $0.09/M-token vision model",
      "~25MB RAM, sub-1% CPU single static binary",
      "Multi-provider routing — vision, summary, standup, and chat can hit different endpoints",
      "Privacy controls — pause toggle, per-app ignore list, automatic frame deletion",
    ],
    architecture:
      "wlroots frame sampler → dedupe → SQLite → 15-min vision summaries (OpenRouter) → QML panel + CLI",
    engineeringDecisions: [
      "Blocks over streams — 15-minute chunks make the timeline readable and the model calls bounded",
      "Edits overlay raw rows — corrections flow into analytics without rewriting history",
      "Dead-letter retries — failed summaries retry 3x then quarantine; `dayflow retry` resets",
    ],
  },
  {
    slug: "pace-server",
    repoName: "Pace-Server",
    displayName: "Pace Server",
    tagline:
      "Sustained production platform — Hetzner, Railway, Cloudflare, Grafana-as-code",
    description:
      "Pace Server (Pace HQ) is the sustained production platform: Rust/Axum gateway, Go/Chi agent backend, and scaffolded Python/LangGraph reasoning on Supabase Postgres with RLS. Identity, billing (Stripe), and auth (Stytch) are live at pacehq.io and app.pacehq.io. Remaining ~20%: real tool execution and the Python reasoning service — not vapor.",
    category: "ai",
    type: "platform",
    featured: true,
    planetVisual: {
      size: "lg",
      shape: "cube",
      color: "#A78BFA",
      rings: [
        { opacity: 0.35, tilt: -18 },
        { opacity: 0.18, tilt: 24 },
      ],
      moons: [
        { label: "pacehq", kind: "live", href: "https://pacehq.io" },
        { label: "Stripe", kind: "stack" },
        { label: "Grafana", kind: "stack" },
      ],
    },
    techStack: [
      "Rust",
      "Axum",
      "Go",
      "Chi",
      "Python",
      "LangGraph",
      "React",
      "Supabase",
      "Stripe",
      "Railway",
    ],
    private: true,
    highlights: [
      "Platform live — gateway, auth, Stripe billing at pacehq.io",
      "Tenant-aware agent pipeline with TierGate and tool registry",
      "Multi-language stack: Rust gateway, Go agents, Python reasoning",
      "Grafana-as-code observability on Railway and Hetzner",
    ],
    architecture:
      "React shell → Rust/Axum gateway → Go/Chi agent backend → Python/LangGraph reasoning → Supabase Postgres + RLS",
    businessContext:
      "Small businesses need cloud productivity without enterprise complexity. Pace packages identity, billing, and AI into one operator-controlled story on real production infra.",
    scopeAndScale:
      "Production-stage multi-tenant platform; public surfaces at pacehq.io, app.pacehq.io, observe.pacehq.io, and status.pacehq.io.",
    engineeringDecisions: [
      "Multi-host production — Hetzner compute, Railway app hosting, Cloudflare edge",
      "Grafana-as-code — dashboards and alerts as versioned infrastructure",
    ],
    finishLine:
      "Gateway, auth, and Stripe billing are live (pacehq.io, app.pacehq.io). Remaining ~20%: real tool execution and Python reasoning service hardening — hire is for last-mile finishing.",
  },
  {
    slug: "openrouter",
    repoName: "openrouter-demos",
    displayName: "OpenRouter Demos",
    tagline:
      "Role-aligned application demos — Deflect, Motion, Bakeoff, Caesar",
    description:
      "Four OpenRouter application demos in github.com/duketopceo/openrouter-demos: Deflect (support classify/deflect/escalate with Guardrails), Motion (GTM inbound → next action with Auto Router), Bakeoff (provider ops — latency, cost, quality launch gate), and Caesar (two-model debate with concession traces). Offline pytest passes on fixtures; live evals require OPENROUTER_API_KEY.",
    category: "ai",
    type: "platform",
    featured: true,
    planetVisual: {
      size: "lg",
      shape: "diamond",
      color: "#A78BFA",
      moons: [
        { label: "Deflect", kind: "subproject" },
        { label: "Motion", kind: "subproject" },
        { label: "Caesar", kind: "subproject" },
      ],
    },
    techStack: ["OpenRouter", "Guardrails", "Auto Router", "Python", "pytest"],
    private: false,
    liveUrl: "https://luke-the-duke.com/openrouter",
    demoUrl: "https://luke-the-duke.com/openrouter",
    embeddable: true,
    demoVideoUrl: OPENROUTER_DEMO_VIDEO_URL,
    highlights: [
      "Deflect — support routing with Guardrails and eval fixtures",
      "Motion — GTM next-action with Auto Router and presets",
      "Bakeoff — provider comparison and launch-gate scoring",
      "Caesar — debate traces with concession rules",
    ],
    architecture:
      "OpenRouter routing → Role-specific eval harness → Guardrails / presets → Launch-gate scoring",
  },
  {
    slug: "homelab",
    repoName: "homelab",
    displayName: "Homelab",
    tagline:
      "Three Tailscale nodes (cluster1–cluster3) — Mac Mini Swarm with Traefik, tunnels, agents, and monitoring",
    description:
      "Personal home lab Docker Swarm on a three-node Tailscale mesh (cluster1 manager, cluster2 and cluster3 workers) running Apple Silicon Mac Minis: Traefik ingress, Cloudflare Tunnel for public routes, asset tracking, monitoring, and auto-discovery. Hosts public showcases such as Cosmic Intelligence and Open Military Hardware DB alongside internal agent stacks. The showcasable infra story for how luke-the-duke.com subdomains are meant to run.",
    category: "infra",
    type: "infra",
    featured: false,
    planetVisual: {
      size: "md",
      shape: "hex",
      color: "#F472B6",
      moons: [
        { label: "Traefik", kind: "stack" },
        { label: "Tailscale", kind: "stack" },
      ],
    },
    techStack: ["Docker", "Swarm", "Traefik", "Cloudflare", "Tailscale"],
    private: true,
    highlights: [
      "Multi-node Swarm on Apple Silicon",
      "Traefik + Cloudflare Tunnel public routing",
      "Agent stacks, monitoring, and auto-discovery",
    ],
    architecture:
      "GitHub deploy → Docker Swarm → Traefik → Cloudflare Tunnel → Public subdomains",
    businessContext:
      "Self-hosted infrastructure that proves production patterns — ingress, TLS, CI deploy, and observability — without a hyperscaler bill.",
    scopeAndScale:
      "Three Tailscale nodes (cluster1–cluster3) hosting portfolio, databases, chat, and agent workloads.",
    engineeringDecisions: [
      "Swarm over k8s — Matches three-node Mac Mini footprint and operator simplicity",
      "Tunnel over port-forward — Public exposure without opening the LAN edge",
    ],
  },
  {
    slug: "luke-agents",
    repoName: "luke-agents",
    displayName: "Luke Agents",
    tagline:
      "King-file standards for AI-assisted engineering — Karpathy principles, guardrails, inheritance",
    description:
      "Source of truth for AI agent behavior across Luke Kimball repositories: constitution (AGENTS.md), Karpathy principles, guardrails, code and testing standards, and tool ecosystem docs. Other repos inherit via thin local AGENTS.md pointers so agents stay consistent without copy-paste drift.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["Markdown", "Agent Standards", "MCP", "Guardrails"],
    private: true,
    highlights: [
      "Single inheritance root for agent behavior",
      "Immutable Karpathy principles + evolving guardrails",
      "Repo-local AGENTS.md specialization pattern",
    ],
    architecture:
      "luke-agents constitution → Repo AGENTS.md pointers → Agent runtimes (Cursor, Claude, Codex)",
    businessContext:
      "Multi-repo agent work fails when each project invents its own rules. Luke Agents centralizes engineering gospel so every session starts from the same constitution.",
    scopeAndScale:
      "Cross-repo standards consumed by active application and infra repositories.",
    engineeringDecisions: [
      "Inheritance over duplication — Thin repo pointers prevent forked standards",
      "Principles immutable, patterns evolve — Separates gospel from tactical guidance",
    ],
  },
  {
    slug: "ai-debate-arena",
    repoName: "ai-debate-arena",
    displayName: "AI Debate Arena",
    tagline:
      "Two AI agents debate any topic — OpenRouter routing and rich terminal UI",
    description:
      "Open-source terminal experience where two AI agents debate a topic using a Venn-diagram prompt system. Routes models through OpenRouter with a rich terminal UI for arguments, rebuttals, and synthesis.",
    category: "ai",
    type: "experiment",
    featured: false,
    techStack: ["Python", "OpenRouter", "Terminal UI"],
    private: false,
    highlights: [
      "Dual-agent debate with structured Venn prompts",
      "OpenRouter model routing for cloud models",
      "Rich terminal UI for following the exchange",
    ],
    architecture:
      "CLI → Prompt orchestrator → OpenRouter → Dual agent turns → Terminal renderer",
  },
  {
    slug: "luke-the-duke-show",
    repoName: "lukethedukeshow",
    displayName: "Luke the Duke Show",
    tagline:
      "Podcast deck and episode shell — broadcast mode for recording-quality presentation",
    description:
      "Next.js podcast site for Luke the Duke Show: episode shell, carousel, and broadcast mode tuned for recording-quality deck presentation. Separate from Cosmic Intelligence (portfolio-hub) but part of the luke-the-duke brand surface.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "Next.js", "Tailwind", "Podcast"],
    private: true,
    highlights: [
      "Episode shell + carousel structure",
      "Broadcast mode for recording-quality decks",
      "Brand-aligned Cosmic visual language",
    ],
    architecture:
      "Next.js App Router → Episode templates → Broadcast deck mode → Static/SSR delivery",
    businessContext:
      "A dedicated show surface for episodes and live recording decks, distinct from the portfolio hub.",
    scopeAndScale:
      "Single-product podcast site with episode catalog and presentation modes.",
    engineeringDecisions: [
      "Separate repo from portfolio-hub — Keeps show content and Cosmic portfolio deploy pipelines independent",
    ],
  },

  // ── Finance & Trading ────────────────────────────────────────────
  {
    slug: "trading-bot",
    repoName: "TradingBot",
    displayName: "TradingBot",
    tagline:
      "Algorithmic trading system with ML-driven signal generation and automated execution",
    description:
      "End-to-end algorithmic trading pipeline that ingests real-time market data from multiple brokerage APIs, generates buy/sell signals through ensemble machine learning models, and executes trades automatically with configurable risk parameters. The backtesting framework processes years of historical data to validate strategies before live deployment. Includes a performance analytics dashboard showing P&L curves, Sharpe ratios, and drawdown analysis. Implements position sizing algorithms and stop-loss guardrails for risk management.",
    category: "finance",
    type: "platform",
    featured: false,
    techStack: ["Python", "Machine Learning", "REST APIs", "Pandas", "NumPy"],
    private: true,
    highlights: [
      "ML signal generation with backtesting framework",
      "Real-time market data ingestion pipeline",
      "Automated risk management and position sizing",
    ],
    architecture:
      "Data ingestion layer → ML signal engine → Risk management → Execution engine → Analytics dashboard",
  },
  {
    slug: "alphahedge",
    repoName: "AlphaHedge-Hedge-Fund-Simulator",
    displayName: "AlphaHedge",
    tagline:
      "Full-stack hedge fund simulation platform with realistic market dynamics",
    description:
      "Interactive hedge fund simulation platform where users construct portfolios, allocate capital across sectors, and respond to realistic market scenarios. The simulation engine models market dynamics including volatility clustering, correlation breakdowns, and liquidity events. Features real-time portfolio valuation with interactive Chart.js visualizations, sector exposure analysis, and risk-adjusted return metrics. Built as a full-stack Next.js application with server-side rendering.",
    category: "finance",
    type: "app",
    featured: false,
    liveUrl: "https://alphahedge.luke-the-duke.com",
    demoUrl: "https://alphahedge.luke-the-duke.com",
    embeddable: true,
    techStack: ["TypeScript", "Next.js", "Financial APIs", "Chart.js"],
    private: true,
    demoOffline: true,
    highlights: [
      "Realistic market dynamics and scenario modeling",
      "Portfolio construction and risk allocation engine",
      "Real-time P&L tracking with interactive charts",
    ],
    architecture:
      "Next.js SSR → Simulation engine → Financial APIs → Chart.js visualizations → Portfolio analytics",
  },
  {
    slug: "ikbr-dashboard",
    repoName: "ibkr-portfolio-dashboard",
    displayName: "IBKR Dashboard",
    tagline:
      "Interactive Brokers portfolio dashboard with real-time data visualization",
    description:
      "Custom portfolio monitoring dashboard that connects to Interactive Brokers' Client Portal API for real-time account data. Displays position-level P&L, sector allocation pie charts, historical equity curves, and trade execution logs using interactive Plotly visualizations. Built as a Python application with automatic data refresh and configurable alert thresholds for position size limits and drawdown warnings.",
    category: "finance",
    type: "app",
    featured: false,
    liveUrl: "https://ibkr.luke-the-duke.com",
    demoUrl: "https://ibkr.luke-the-duke.com",
    embeddable: true,
    techStack: ["Python", "Plotly", "IBKR API", "Pandas"],
    private: true,
    demoOffline: true,
    highlights: [
      "Real-time IBKR API integration",
      "Interactive Plotly visualizations",
      "Account analytics and position tracking",
    ],
  },
  {
    slug: "finance-frenzy",
    repoName: "FinanceFrenzy",
    displayName: "Finance Frenzy",
    tagline:
      "Finance simulation game — Hackathon winner (Best Finance Hack & Top 6)",
    description:
      "Award-winning hackathon project that gamifies financial literacy through an interactive simulation. Players manage virtual portfolios, respond to market events, and learn investment concepts through gameplay. Won Best Finance Hack and placed Top 6 overall.",
    category: "finance",
    type: "app",
    featured: false,
    liveUrl: "https://devpost.com/software/finance-frenzy/",
    demoUrl: "https://devpost.com/software/finance-frenzy/",
    embeddable: false,
    techStack: ["Python", "PyQt", "Simulation", "Game Design"],
    private: false,
    highlights: [
      "Hackathon winner: Best Finance Hack & Top 6",
      "Gamified financial literacy through simulation",
      "Interactive portfolio management gameplay",
    ],
  },

  {
    slug: "nem-stock-pitch",
    repoName: "nem-stock-pitch",
    displayName: "NEM Stock Pitch",
    tagline:
      "Institutional-grade equity research — LONG Newmont, built entirely with Perplexity Computer",
    description:
      "Interactive stock pitch arguing Newmont (NEM) is not a gold miner but a sovereign hedge fund. Built for the 2026 Perplexity Computer Stock Pitch Competition judged by Philippe Laffont (Coatue), Dan Loeb (Third Point), and Ken Hao (Silver Lake). The thesis rests on macro inevitability ($39T national debt, $193.6T unfunded liabilities, M2 expansion), three structural legs (central bank gold bid, hidden copper call, nuclear-mining nexus), and an AI hardware demand angle (gold + copper in every chip and data center). Features Chart.js visualizations, MapLibre globe, peer comparison tables, and oil sensitivity analysis. Dark theme, responsive, single-page.",
    category: "finance",
    type: "app",
    featured: false,
    liveUrl: "https://nem.luke-the-duke.com",
    demoUrl: "https://nem.luke-the-duke.com",
    embeddable: false,
    demoOffline: true,
    techStack: ["HTML/CSS", "Chart.js", "MapLibre", "Perplexity Computer"],
    private: false,
    highlights: [
      "Built entirely with Perplexity Computer — research, code, deploy",
      "Macro thesis: $193.6T unfunded liabilities, 863t CB gold buying",
      "Multi-angle analysis: copper, nuclear, AI hardware demand",
      "Competition: Laffont, Loeb, Hao judging panel",
    ],
    architecture:
      "Static HTML/CSS → Chart.js charts → MapLibre globe → Responsive single-page app",
  },

  // ── AI & Automation ──────────────────────────────────────────────
  {
    slug: "skyguard-ai",
    repoName: "BartlettBot",
    displayName: "SkyGuard AI",
    tagline:
      "Intelligent roofing assistant — permit coordination, document analysis, customer comms",
    description:
      "AI-powered platform purpose-built for roofing contractors that automates the permit coordination workflow — from initial application through approval tracking. The document analysis pipeline uses Google's Gemini models to extract key information from construction plans, municipal codes, and insurance documents. Customer communication management handles scheduling, follow-ups, and status updates across channels. Backend runs on FastAPI with a Gradio interface for rapid internal prototyping.",
    category: "ai",
    type: "platform",
    featured: false,
    liveUrl: "https://skyguard.luke-the-duke.com",
    demoUrl: "https://skyguard.luke-the-duke.com",
    embeddable: true,
    techStack: ["Python", "FastAPI", "Gemini", "Gradio", "Google Cloud"],
    private: true,
    demoOffline: true,
    highlights: [
      "LLM-powered document analysis pipeline",
      "Automated permit coordination workflow",
      "Multi-channel customer communications",
    ],
    architecture:
      "FastAPI backend → Gemini LLM pipeline → Document processor → Gradio interface → Google Cloud services",
  },
  {
    slug: "quiz-the-best",
    repoName: "QuizTheBest",
    displayName: "QuizTheBest",
    tagline:
      "LLM-powered study tool — auto-generates quizzes and flashcards from any source",
    description:
      "Study tool that uses large language models to automatically generate quizzes and flashcards from web content. Extracts key concepts from any URL, generates question-answer pairs, and presents them in an adaptive learning interface.",
    category: "ai",
    type: "app",
    featured: false,
    liveUrl: "https://quiz.luke-the-duke.com",
    demoUrl: "https://quiz.luke-the-duke.com",
    embeddable: true,
    techStack: ["TypeScript", "LLM APIs", "React Native", "NLP"],
    private: false,
    demoOffline: true,
    highlights: [
      "Automatic quiz generation from web sources",
      "Adaptive learning algorithm",
      "Cross-platform mobile interface",
    ],
  },
  {
    slug: "optimezer",
    repoName: "Zer_solutions",
    displayName: "OptiMezer",
    tagline:
      "Small business AI integration platform for workflow automation",
    description:
      "Platform that helps small businesses adopt AI by automating repetitive workflows. Provides pre-built integrations for common business processes — invoicing, scheduling, customer follow-ups — powered by ML models that learn from usage patterns.",
    category: "ai",
    type: "platform",
    featured: false,
    techStack: ["Python", "AI/ML", "REST APIs", "Automation"],
    private: true,
    highlights: [
      "Pre-built workflow automation templates",
      "ML models that adapt to usage patterns",
      "Small business-focused integrations",
    ],
  },

  {
    slug: "nanoclaw",
    repoName: "nanoclaw",
    displayName: "NanoClaw",
    tagline:
      "Lightweight agentic AI container that connects to WhatsApp, Telegram, Slack, Discord, Gmail",
    description:
      "Lightweight agentic AI container that connects to WhatsApp, Telegram, Slack, Discord, Gmail. Features persistent memory across sessions, scheduled job execution, and runs on the Anthropic Agents SDK. Containerized for security isolation with multi-platform messaging integrations.",
    category: "ai",
    type: "platform",
    featured: false,
    liveUrl: "https://nanoclaw.dev",
    demoUrl: "https://nanoclaw.dev",
    embeddable: false,
    techStack: ["TypeScript", "Anthropic SDK", "Docker", "Node.js"],
    private: false,
    highlights: [
      "Multi-platform messaging integrations",
      "Persistent memory across sessions",
      "Scheduled job execution",
      "Containerized for security isolation",
    ],
  },

  // ── OSINT & Data ─────────────────────────────────────────────────
  {
    slug: "republic-atlas",
    repoName: "republic-atlas",
    displayName: "Republic Atlas",
    tagline:
      "Political data intelligence platform — election analytics and civic mapping",
    description:
      "Full-stack data intelligence platform for political analytics. Aggregates election data, voter demographics, and civic information into interactive maps and dashboards. Features real-time data pipelines, geographic visualization, and trend analysis.",
    category: "osint",
    type: "platform",
    featured: false,
    liveUrl: "https://republicatlas.com",
    demoUrl: "https://republicatlas.com",
    embeddable: false,
    techStack: ["Python", "Firebase", "Data Visualization", "GIS"],
    private: false,
    highlights: [
      "Interactive election analytics maps",
      "Real-time data aggregation pipelines",
      "Geographic visualization with GIS",
    ],
    architecture:
      "Firebase hosting → Python data pipelines → GIS visualization layer → Interactive election maps",
  },
  {
    slug: "military-hardware-db",
    repoName: "open-military-hardware-db",
    displayName: "Open Military Hardware DB",
    tagline:
      "Comprehensive open-source weapons systems database — air, land, sea, munitions",
    description:
      "Open-source intelligence database cataloging 183 military hardware platforms across air, land, sea, munitions, and software domains. Features a FastAPI REST API with filtering, pagination, and comparison endpoints. The React frontend provides an intelligence console with platform explorer, analytics dashboard, and side-by-side comparison tools. Includes SIPRI military expenditure data, 675 source citations, and role classification for every platform.",
    category: "osint",
    type: "library",
    featured: false,
    planetVisual: {
      size: "md",
      shape: "diamond",
      color: "#FBBF24",
      moons: [
        {
          label: "omhdb",
          kind: "live",
          href: "https://omhdb.luke-the-duke.com/#/",
        },
      ],
    },
    liveUrl: "https://omhdb.luke-the-duke.com/#/",
    demoUrl: "https://omhdb.luke-the-duke.com/#/",
    embeddable: true,
    techStack: ["Data", "OSINT", "JSON", "Documentation"],
    private: false,
    demoOffline: false,
    highlights: [
      "Comprehensive multi-domain weapons catalog",
      "Structured data for research and analysis",
      "Open-source intelligence methodology",
    ],
    architecture:
      "SQLite database → FastAPI REST API → React intelligence console → Docker container → Swarm deployment",
  },
  {
    slug: "etl-pipeline",
    repoName: "ETL-Pipeline",
    displayName: "ETL Pipeline",
    tagline:
      "Data engineering pipeline for extraction, transformation, and loading workflows",
    description:
      "Modular data engineering framework implementing ETL best practices. Supports multiple data sources, configurable transformation steps, and various output targets. Built with extensibility in mind for different data processing scenarios.",
    category: "data",
    type: "library",
    featured: false,
    techStack: ["Python", "Jupyter", "Pandas", "ETL"],
    private: false,
    highlights: [
      "Modular pipeline architecture",
      "Configurable transformation steps",
      "Multiple data source connectors",
    ],
  },

  // ── Infrastructure ───────────────────────────────────────────────
  {
    slug: "server-cluster",
    repoName: "Bartlett-server-001",
    displayName: "Production Cluster",
    tagline:
      "Docker Swarm infrastructure — multi-node cluster with Traefik, monitoring, and CI/CD",
    description:
      "Three-node Docker Swarm on Tailscale (cluster1 / cluster-1-master as manager, cluster2 and cluster3 as workers) running Apple Silicon Mac Minis. Features automated container deployments via GitHub webhooks, Traefik reverse proxy handling TLS termination and routing for multiple subdomains, Cloudflare Tunnel for secure public access without port forwarding, and Tailscale mesh VPN for encrypted inter-node communication. Currently hosts the portfolio site, military hardware database, and several internal tools.",
    category: "infra",
    type: "infra",
    featured: false,
    techStack: ["Docker", "Shell", "Traefik", "Cloudflare", "Tailscale"],
    private: true,
    highlights: [
      "Multi-node Docker Swarm orchestration",
      "CI/CD with automatic container deployments",
      "Zero-trust networking with Tailscale mesh",
    ],
    architecture:
      "GitHub webhooks → Docker Swarm → Traefik routing → Cloudflare Tunnel → Public subdomains",
  },

  // ── Education & Study ────────────────────────────────────────────
  {
    slug: "series65-study-app",
    repoName: "series65-study-app",
    displayName: "Series 65 Study Hub",
    tagline:
      "Multi-course study platform — Series 65 exam prep with adaptive quizzing and progress tracking",
    description:
      "Full-stack study platform built for the Series 65 (Uniform Investment Adviser Law Examination) with a multi-course architecture designed to expand into additional subjects. Features chapter-by-chapter quizzing, cumulative exams, progress tracking, and anti-cheating enforcement. The platform includes a hub dashboard with course cards, full CI/CD pipeline with GitHub Actions, Playwright end-to-end tests, and security hardening. Built with Next.js and deployed on Docker Swarm.",
    category: "apps",
    type: "app",
    featured: false,
    liveUrl: "https://study.luke-the-duke.com",
    demoUrl: "https://study.luke-the-duke.com",
    embeddable: true,
    techStack: ["TypeScript", "Next.js", "Playwright", "Docker", "CI/CD"],
    private: true,
    demoOffline: true,
    highlights: [
      "Multi-course architecture with extensible schema",
      "Adaptive quizzing with anti-cheating enforcement",
      "Full CI/CD with Playwright e2e test suite",
      "Progress tracking and performance analytics",
    ],
    architecture:
      "Next.js SSR → Course content engine → Quiz system → Progress tracker → Docker Swarm deployment",
  },

  // ── Apps & Web ───────────────────────────────────────────────────
  {
    slug: "dixi",
    repoName: "Dixi",
    displayName: "Dixi",
    tagline: "AI-powered interactive projection system with computer vision and gesture recognition",
    description:
      "AI-powered interactive projection system using computer vision, gesture recognition, and real-time AI to transform any surface into a responsive knowledge canvas. Features MediaPipe-based hand/face/pose tracking, WebGL 3D scene rendering, and a multi-service architecture with Express backend, Vite React frontend, and Python vision pipeline.",
    category: "apps",
    type: "app",
    featured: false,
    liveUrl: "https://dixi.luke-the-duke.com",
    demoUrl: "https://dixi.luke-the-duke.com",
    embeddable: true,
    techStack: ["TypeScript", "React", "Node.js", "Python", "MediaPipe"],
    private: false,
    demoOffline: true,
    highlights: [
      "End-to-end TypeScript type safety",
      "Server-side rendering with API routes",
      "Modern React patterns and responsive UI",
    ],
  },
  {
    slug: "stratum-hq",
    repoName: "stratum-engine",
    repoOwner: "Herzog-LLC",
    displayName: "Stratum Engine",
    tagline:
      "AI-powered operations backend for home service contractors — live at stratumhq.app",
    description:
      "Stratum Engine is the operations backend for home service contractors — AI-powered intake, dispatch, and workflow. The public shell lives at stratumhq.app; source stays private under Herzog-LLC.",
    category: "apps",
    type: "platform",
    featured: true,
    planetVisual: {
      size: "lg",
      shape: "cube",
      color: "#34D399",
      moons: [
        { label: "stratumhq", kind: "live", href: "https://stratumhq.app" },
      ],
    },
    embeddable: false,
    techStack: ["TypeScript", "Next.js", "Docker"],
    private: true,
    highlights: [
      "AI-powered operations backend for home service contractors",
      "Product engine and brand shell for the Stratum surface",
      "Roadmap-aligned infrastructure story",
    ],
  },
  {
    slug: "chronicle-weaver",
    repoName: "rork-chronicle-weaver",
    displayName: "Chronicle Weaver",
    tagline: "Interactive narrative and storytelling platform",
    description:
      "Platform for creating and experiencing interactive narratives. Users build branching storylines with rich media support, and readers navigate through them with choices that shape the narrative. Mobile-first design with offline support.",
    category: "apps",
    type: "app",
    featured: false,
    liveUrl: "https://chronicleweaver.com",
    demoUrl: "https://chronicleweaver.com",
    embeddable: false,
    techStack: ["TypeScript", "React", "Mobile"],
    private: false,
    highlights: [
      "Branching narrative engine",
      "Rich media storytelling",
      "Mobile-first with offline support",
    ],
  },
  {
    slug: "collaborative-essay",
    repoName: "Collaborative-essay",
    displayName: "Collaborative Essay",
    tagline: "Real-time collaborative writing and editing tool",
    description:
      "Real-time collaborative writing tool that allows multiple users to edit documents simultaneously. Features conflict resolution, version history, and a clean editing interface built with WebSocket-based synchronization.",
    category: "apps",
    type: "app",
    featured: false,
    liveUrl: "https://essay.luke-the-duke.com",
    demoUrl: "https://essay.luke-the-duke.com",
    embeddable: true,
    techStack: ["TypeScript", "Real-time", "WebSockets"],
    private: false,
    demoOffline: true,
    highlights: [
      "Real-time multi-user collaboration",
      "Conflict resolution and version history",
      "WebSocket-based synchronization",
    ],
  },
  {
    slug: "personal-blog",
    repoName: "Luke-the-Duke-Blogger",
    displayName: "Technical Blog",
    tagline: "Personal blog and writing platform",
    description:
      "Custom-built blogging platform with a headless CMS backend, server-side rendered with Next.js for SEO optimization. Features a clean reading experience with automatic dark mode, code syntax highlighting with language detection, and RSS feed generation. The editing interface supports markdown with live preview and image optimization.",
    category: "apps",
    type: "app",
    featured: false,
    liveUrl: "https://blog.luke-the-duke.com",
    demoUrl: "https://blog.luke-the-duke.com",
    embeddable: true,
    techStack: ["TypeScript", "Next.js", "CMS"],
    private: true,
    demoOffline: true,
    highlights: [
      "Custom CMS integration",
      "SEO optimization and RSS generation",
      "Syntax highlighting for code blocks",
    ],
  },
  {
    slug: "curious-storycard",
    repoName: "curious-storycard",
    displayName: "Curious",
    tagline:
      "Instagram for curiosity — swipeable knowledge cards with rich media storytelling",
    description:
      "Native iOS app that reimagines content consumption as swipeable story cards. Each card presents a bite-sized topic with rich media — images, key facts, and narrative text — in a format designed for casual learning. Features a card creation workflow, discovery feed, and personal library. Built with Swift and SwiftUI, with a Docker-hosted backend API and PostgreSQL database.",
    category: "apps",
    type: "app",
    featured: false,
    liveUrl: "https://curious.luke-the-duke.com",
    demoUrl: "https://curious.luke-the-duke.com",
    embeddable: true,
    techStack: ["Swift", "SwiftUI", "Docker", "PostgreSQL", "REST API"],
    private: true,
    demoOffline: true,
    highlights: [
      "Native iOS with SwiftUI interface",
      "Swipeable card-based content experience",
      "Docker-hosted backend with PostgreSQL",
      "36 passing backend tests with CI pipeline",
    ],
  },

  ...projectExtensionConfigs,
];

/**
 * Category metadata for display
 */
export const categoryMeta: Record<
  string,
  { label: string; description: string; icon: string }
> = {
  finance: {
    label: "Finance & Trading",
    description:
      "Algorithmic trading, portfolio analytics, and market simulation",
    icon: "chart",
  },
  ai: {
    label: "AI & Automation",
    description:
      "LLM-powered tools, intelligent assistants, and workflow automation",
    icon: "cpu",
  },
  osint: {
    label: "OSINT & Data",
    description:
      "Open-source intelligence, data platforms, and civic tech",
    icon: "search",
  },
  data: {
    label: "Data Engineering",
    description:
      "ETL pipelines, data processing, and analytics infrastructure",
    icon: "database",
  },
  infra: {
    label: "Infrastructure",
    description:
      "Docker Swarm, server clusters, networking, and DevOps",
    icon: "server",
  },
  apps: {
    label: "Apps & Web",
    description:
      "Full-stack applications, blogs, and interactive platforms",
    icon: "globe",
  },
};
