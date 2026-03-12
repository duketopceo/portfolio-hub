import { ProjectConfig } from "@/lib/types";

/**
 * Master project configuration.
 * Each entry maps a GitHub repo to its portfolio presentation.
 * Only repos listed here appear on the portfolio — everything else is ignored.
 *
 * To add a project: add an entry here with the repo name.
 * To add a live URL: set `liveUrl` and optionally `subdomain`.
 */
export const projectConfigs: ProjectConfig[] = [
  // ── Finance & Trading ────────────────────────────────────────────
  {
    slug: "trading-bot",
    repoName: "TradingBot",
    displayName: "TradingBot",
    tagline: "AI-powered algorithmic trading system with ML signal generation",
    category: "finance",
    type: "app",
    featured: true,
    techStack: ["Python", "Machine Learning", "REST APIs", "Pandas"],
    private: true,
  },
  {
    slug: "alphahedge",
    repoName: "AlphaHedge-Hedge-Fund-Simulator",
    displayName: "AlphaHedge",
    tagline: "Full-stack hedge fund simulation platform with real market dynamics",
    category: "finance",
    type: "app",
    featured: true,
    techStack: ["TypeScript", "Next.js", "Financial APIs", "Charts"],
    private: true,
  },
  {
    slug: "ikbr-dashboard",
    repoName: "IKBR-Python-dashboard",
    displayName: "IBKR Dashboard",
    tagline: "Interactive Brokers portfolio dashboard with real-time data visualization",
    category: "finance",
    type: "app",
    featured: false,
    techStack: ["Python", "Plotly", "IBKR API", "Pandas"],
    private: true,
  },
  {
    slug: "finance-frenzy",
    repoName: "FinanceFrenzy",
    displayName: "Finance Frenzy",
    tagline: "Finance simulation game — Hackathon winner (Best Finance Hack & Top 6)",
    category: "finance",
    type: "app",
    featured: false,
    liveUrl: "https://devpost.com/software/finance-frenzy/",
    techStack: ["Python", "PyQt", "Simulation"],
    private: false,
  },

  // ── AI & Automation ──────────────────────────────────────────────
  {
    slug: "bartlett-bot",
    repoName: "BartlettBot",
    displayName: "SkyGuard AI",
    tagline: "Intelligent roofing assistant — permit coordination, document analysis, customer comms",
    category: "ai",
    type: "platform",
    featured: true,
    techStack: ["Python", "FastAPI", "Gemini", "Gradio", "Google Cloud"],
    private: true,
  },
  {
    slug: "quiz-the-best",
    repoName: "QuizTheBest",
    displayName: "QuizTheBest",
    tagline: "LLM-powered study tool — auto-generates quizzes and flashcards from web sources",
    category: "ai",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "LLM APIs", "React Native", "Web Scraping"],
    private: false,
  },
  {
    slug: "zer-solutions",
    repoName: "Zer_solutions",
    displayName: "OptiMezer",
    tagline: "Small business AI integration platform for workflow automation",
    category: "ai",
    type: "platform",
    featured: false,
    techStack: ["Python", "AI/ML", "REST APIs", "Automation"],
    private: true,
  },

  // ── OSINT & Data ─────────────────────────────────────────────────
  {
    slug: "republic-atlas",
    repoName: "republic-atlas",
    displayName: "Republic Atlas",
    tagline: "Political data intelligence platform — election analytics and civic mapping",
    category: "osint",
    type: "platform",
    featured: true,
    liveUrl: "https://republic-atlas.web.app/elections?state=IL",
    subdomain: "atlas",
    techStack: ["Python", "Firebase", "Data Viz", "GIS"],
    private: true,
  },
  {
    slug: "military-hardware-db",
    repoName: "open-military-hardware-db",
    displayName: "Open Military Hardware DB",
    tagline: "Comprehensive open-source weapons systems database — air, land, sea, munitions",
    category: "osint",
    type: "library",
    featured: true,
    subdomain: "osint",
    techStack: ["Data", "OSINT", "JSON", "Documentation"],
    private: false,
  },
  {
    slug: "etl-pipeline",
    repoName: "ETL-Pipeline",
    displayName: "ETL Pipeline",
    tagline: "Data engineering pipeline for extraction, transformation, and loading workflows",
    category: "data",
    type: "library",
    featured: false,
    techStack: ["Python", "Jupyter", "Pandas", "ETL"],
    private: false,
  },

  // ── Infrastructure ───────────────────────────────────────────────
  {
    slug: "bartlett-server",
    repoName: "Bartlett-server-001",
    displayName: "Bartlett Server Cluster",
    tagline: "Docker Swarm infrastructure — Mac mini cluster with Traefik, monitoring, and CI/CD",
    category: "infra",
    type: "infra",
    featured: true,
    techStack: ["Docker", "Shell", "Traefik", "Cloudflare", "Tailscale"],
    private: true,
  },

  // ── Apps & Web ───────────────────────────────────────────────────
  {
    slug: "dixi",
    repoName: "Dixi",
    displayName: "Dixi",
    tagline: "Full-stack TypeScript application with rich feature set",
    category: "apps",
    type: "app",
    featured: true,
    techStack: ["TypeScript", "React", "Node.js"],
    private: false,
  },
  {
    slug: "chronicle-weaver",
    repoName: "rork-chronicle-weaver",
    displayName: "Chronicle Weaver",
    tagline: "Interactive narrative and storytelling platform",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "React", "Mobile"],
    private: false,
  },
  {
    slug: "collaborative-essay",
    repoName: "Collaborative-essay",
    displayName: "Collaborative Essay",
    tagline: "Real-time collaborative writing and editing tool",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "Real-time", "WebSockets"],
    private: false,
  },
  {
    slug: "luke-the-duke-blog",
    repoName: "Luke-the-Duke-Blogger",
    displayName: "Luke the Duke Blog",
    tagline: "Personal blog and writing platform",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "Next.js", "CMS"],
    private: true,
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
    description: "Algorithmic trading, portfolio analytics, and market simulation",
    icon: "📊",
  },
  ai: {
    label: "AI & Automation",
    description: "LLM-powered tools, intelligent assistants, and workflow automation",
    icon: "🤖",
  },
  osint: {
    label: "OSINT & Data",
    description: "Open-source intelligence, data platforms, and civic tech",
    icon: "🔍",
  },
  data: {
    label: "Data Engineering",
    description: "ETL pipelines, data processing, and analytics infrastructure",
    icon: "⚙️",
  },
  infra: {
    label: "Infrastructure",
    description: "Docker Swarm, server clusters, networking, and DevOps",
    icon: "🏗️",
  },
  apps: {
    label: "Apps & Web",
    description: "Full-stack applications, blogs, and interactive platforms",
    icon: "🌐",
  },
};
