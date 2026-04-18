import { ProjectConfig } from "@/lib/types";

/**
 * Master project configuration — curated for recruiter/professional viewing.
 * SECURITY: No personal emails, no GitHub usernames, no internal details.
 */
export const projectConfigs: ProjectConfig[] = [
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
    featured: true,
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
    featured: true,
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
    repoName: "",
    displayName: "NEM Stock Pitch",
    tagline:
      "Institutional-grade equity research — LONG Newmont, built entirely with Perplexity Computer",
    description:
      "Interactive stock pitch arguing Newmont (NEM) is not a gold miner but a sovereign hedge fund. Built for the 2026 Perplexity Computer Stock Pitch Competition judged by Philippe Laffont (Coatue), Dan Loeb (Third Point), and Ken Hao (Silver Lake). The thesis rests on macro inevitability ($39T national debt, $193.6T unfunded liabilities, M2 expansion), three structural legs (central bank gold bid, hidden copper call, nuclear-mining nexus), and an AI hardware demand angle (gold + copper in every chip and data center). Features Chart.js visualizations, MapLibre globe, peer comparison tables, and oil sensitivity analysis. Dark theme, responsive, single-page.",
    category: "finance",
    type: "app",
    featured: true,
    liveUrl: "https://nem.luke-the-duke.com",
    demoUrl: "https://nem.luke-the-duke.com",
    embeddable: true,
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
    featured: true,
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
    featured: true,
    liveUrl: "https://republicatlas.com",
    demoUrl: "https://republicatlas.com",
    embeddable: true,
    techStack: ["Python", "Firebase", "Data Visualization", "GIS"],
    private: true,
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
    featured: true,
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
      "Multi-node Docker Swarm infrastructure running on Apple Silicon Mac Minis in a home lab configuration. Features automated container deployments via GitHub webhooks, Traefik reverse proxy handling TLS termination and routing for multiple subdomains, Cloudflare Tunnel for secure public access without port forwarding, and Tailscale mesh VPN for encrypted inter-node communication. Currently hosts the portfolio site, military hardware database, and several internal tools.",
    category: "infra",
    type: "infra",
    featured: true,
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
    featured: true,
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
    featured: true,
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
