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
      "End-to-end trading pipeline that ingests real-time market data, generates signals through machine learning models, and executes trades automatically via brokerage APIs. Features backtesting framework, risk management guardrails, and performance analytics dashboard.",
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
  },
  {
    slug: "alphahedge",
    repoName: "AlphaHedge-Hedge-Fund-Simulator",
    displayName: "AlphaHedge",
    tagline:
      "Full-stack hedge fund simulation platform with realistic market dynamics",
    description:
      "Interactive simulation platform that models hedge fund operations — portfolio construction, risk allocation, market scenarios, and P&L tracking. Built as a full-stack web application with real-time charts and financial data integration.",
    category: "finance",
    type: "app",
    featured: true,
    techStack: ["TypeScript", "Next.js", "Financial APIs", "Chart.js"],
    private: true,
    highlights: [
      "Realistic market dynamics and scenario modeling",
      "Portfolio construction and risk allocation engine",
      "Real-time P&L tracking with interactive charts",
    ],
  },
  {
    slug: "ikbr-dashboard",
    repoName: "IKBR-Python-dashboard",
    displayName: "IBKR Dashboard",
    tagline:
      "Interactive Brokers portfolio dashboard with real-time data visualization",
    description:
      "Custom dashboard that connects to the Interactive Brokers API for real-time portfolio monitoring. Features account analytics, position tracking, historical performance charts, and trade execution monitoring.",
    category: "finance",
    type: "app",
    featured: false,
    techStack: ["Python", "Plotly", "IBKR API", "Pandas"],
    private: true,
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

  // ── AI & Automation ──────────────────────────────────────────────
  {
    slug: "skyguard-ai",
    repoName: "BartlettBot",
    displayName: "SkyGuard AI",
    tagline:
      "Intelligent roofing assistant — permit coordination, document analysis, customer comms",
    description:
      "AI-powered platform for the roofing industry that automates permit coordination, analyzes construction documents with LLMs, and manages customer communications. Integrates Google Cloud services with a FastAPI backend and Gradio interface for rapid prototyping.",
    category: "ai",
    type: "platform",
    featured: true,
    techStack: ["Python", "FastAPI", "Gemini", "Gradio", "Google Cloud"],
    private: true,
    highlights: [
      "LLM-powered document analysis pipeline",
      "Automated permit coordination workflow",
      "Multi-channel customer communications",
    ],
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
    techStack: ["TypeScript", "LLM APIs", "React Native", "NLP"],
    private: false,
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
    liveUrl: "https://republic-atlas.web.app/elections?state=IL",
    demoUrl: "https://republic-atlas.web.app/elections?state=IL",
    embeddable: true,
    techStack: ["Python", "Firebase", "Data Visualization", "GIS"],
    private: true,
    highlights: [
      "Interactive election analytics maps",
      "Real-time data aggregation pipelines",
      "Geographic visualization with GIS",
    ],
  },
  {
    slug: "military-hardware-db",
    repoName: "open-military-hardware-db",
    displayName: "Open Military Hardware DB",
    tagline:
      "Comprehensive open-source weapons systems database — air, land, sea, munitions",
    description:
      "Open-source intelligence database cataloging military hardware across all domains. Structured data covering specifications, capabilities, operators, and deployment history for weapons systems worldwide. Designed for researchers and analysts.",
    category: "osint",
    type: "library",
    featured: true,
    techStack: ["Data", "OSINT", "JSON", "Documentation"],
    private: false,
    highlights: [
      "Comprehensive multi-domain weapons catalog",
      "Structured data for research and analysis",
      "Open-source intelligence methodology",
    ],
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
      "Production infrastructure running on a multi-node Docker Swarm cluster. Features automated deployments via CI/CD pipelines, Traefik reverse proxy with automatic TLS, Cloudflare tunnel networking, and Tailscale mesh for secure inter-node communication.",
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
  },

  // ── Apps & Web ───────────────────────────────────────────────────
  {
    slug: "dixi",
    repoName: "Dixi",
    displayName: "Dixi",
    tagline: "Full-stack TypeScript application with rich feature set",
    description:
      "Full-stack TypeScript application demonstrating modern web development patterns — server-side rendering, API routes, database integration, and responsive UI. Built with a focus on type safety and developer experience.",
    category: "apps",
    type: "app",
    featured: true,
    techStack: ["TypeScript", "React", "Node.js"],
    private: false,
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
    techStack: ["TypeScript", "Real-time", "WebSockets"],
    private: false,
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
      "Custom-built blog platform with CMS integration, markdown rendering, and SEO optimization. Features a clean reading experience with dark mode, code syntax highlighting, and RSS feed generation.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "Next.js", "CMS"],
    private: true,
    highlights: [
      "Custom CMS integration",
      "SEO optimization and RSS generation",
      "Syntax highlighting for code blocks",
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
