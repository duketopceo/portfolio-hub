import type { ProjectConfig } from "@/lib/types";

/**
 * 23 missing GitHub repos discovered by the repo inventory pass.
 * These are merged into the main projectConfigs array in projects.ts.
 */
export const projectExtensionConfigs: ProjectConfig[] = [
  {
    slug: "omarchy-agents",
    repoName: "omarchy-agents",
    displayName: "Omarchy Agents",
    tagline: "Claude Code, Codex, and Fireworks usage panel in the Omarchy bar",
    description:
      "Native Omarchy bar panel that tracks AI-coding agent usage — Claude Code, Codex, and Fireworks — showing limits, burn rates, and daily pace in a compact HUD.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "Omarchy", "OpenRouter", "Claude Code"],
    private: false,
    highlights: [
      "Live usage telemetry for multiple agent runtimes",
      "Limit and budget pacing UI",
      "Native Omarchy bar widget",
    ],
    architecture:
      "Omarchy bar widget → usage counters → per-model limit tracking → compact HUD",
  },
  {
    slug: "omarchy-fan",
    repoName: "omarchy-fan",
    displayName: "Omarchy Fan",
    tagline: "RAM, CPU/GPU/NVMe thermals and fan presets in the Omarchy bar",
    description:
      "Hardware thermal monitor that surfaces RAM, CPU, GPU, and NVMe temperatures, top processes, and configurable fan presets directly in the Omarchy bar.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "Omarchy", "Hardware Monitoring"],
    private: false,
    highlights: [
      "Real-time CPU/GPU/NVMe thermal telemetry",
      "Configurable fan presets",
      "Top-process overlay",
    ],
    architecture:
      "Omarchy bar widget → system sensors → process list → fan controller",
  },
  {
    slug: "omarchy-nexus",
    repoName: "omarchy-nexus",
    displayName: "Omarchy Nexus",
    tagline: "Hardware topology radar bar widget for Omarchy",
    description:
      "Live hardware topology radar for the Omarchy bar. Visualizes USB, Bluetooth, network, and storage connections in a compact, always-visible widget.",
    category: "apps",
    type: "platform",
    featured: false,
    techStack: ["TypeScript", "Omarchy", "Hardware", "Bluetooth"],
    private: false,
    highlights: [
      "Live USB, Bluetooth, network, storage topology",
      "Compact radar-style widget",
      "Hardware discovery in the menu bar",
    ],
    architecture:
      "Omarchy bar widget → system discovery → device graph → radar UI",
  },
  {
    slug: "omarchy-standby",
    repoName: "omarchy-standby",
    displayName: "Omarchy Standby",
    tagline: "Fullscreen nightstand overlay for Omarchy",
    description:
      "Nightstand overlay with clock, weather, red-tint low-brightness mode, and caffeine toggles. Built as a fullscreen companion for Omarchy.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "Omarchy", "UI"],
    private: false,
    highlights: [
      "Red-tint low-brightness night mode",
      "Clock and weather overlay",
      "Caffeine toggle integration",
    ],
    architecture:
      "Fullscreen overlay → clock/weather data → brightness and caffeine toggles",
  },
  {
    slug: "omarchy-ticker",
    repoName: "omarchy-ticker",
    displayName: "Omarchy Ticker",
    tagline: "Gold, tech, nuclear, energy, and rates in the Omarchy bar",
    description:
      "Market ticker for the Omarchy bar. Tracks gold, tech, nuclear, energy, and interest-rate signals in a compact, glanceable stream.",
    category: "finance",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "Omarchy", "Market Data"],
    private: false,
    highlights: [
      "Multi-asset market ticker in the menu bar",
      "Gold, tech, nuclear, energy, rates coverage",
      "Compact always-visible UI",
    ],
    architecture: "Data feed → ticker engine → Omarchy bar widget",
  },
  {
    slug: "omarchy-plugins",
    repoName: "omarchy-plugins",
    displayName: "Omarchy Plugins",
    tagline: "Umbrella catalog of Omarchy bar plugins",
    description:
      "Catalog and documentation hub for the Omarchy bar plugin ecosystem — fan/thermals, market ticker, AI-agent usage, and OLED standby overlay.",
    category: "apps",
    type: "library",
    featured: false,
    techStack: ["TypeScript", "Omarchy", "Plugins"],
    private: false,
    highlights: [
      "Central plugin registry and docs",
      "Fan/thermals, ticker, agent usage, standby overlays",
      "Ecosystem documentation",
    ],
    architecture:
      "Plugin catalog → markdown docs → per-plugin build/usage instructions",
  },
  {
    slug: "argus",
    repoName: "Argus",
    displayName: "Argus",
    tagline: "Open-source vision-model E2E testing harness",
    description:
      "End-to-end testing harness for vision models. Record, replay, heal, and assert with BYOK OpenRouter, hard budget caps, self-hosted runner, and GitHub PR reporting.",
    category: "ai",
    type: "platform",
    featured: false,
    techStack: ["TypeScript", "OpenRouter", "Vision Models", "GitHub"],
    private: false,
    highlights: [
      "Vision-model E2E recording and replay",
      "Self-hosted runner with hard budget caps",
      "GitHub PR reporting",
    ],
    architecture:
      "Test recorder → vision model assertions → self-hosted runner → GitHub PR bot",
  },
  {
    slug: "orchestral",
    repoName: "orchestral",
    displayName: "Orchestral",
    tagline: "OpenRouter eval harness for cheap orchestrator + worker stacks",
    description:
      "Eval harness that tests whether a cheap orchestrator plus cheap workers can produce frontier-quality output through OpenRouter routing.",
    category: "ai",
    type: "experiment",
    featured: false,
    techStack: ["Python", "OpenRouter", "Eval", "LLM"],
    private: false,
    highlights: [
      "Orchestrator + worker eval design",
      "OpenRouter multi-model routing",
      "Cost-quality frontier measurement",
    ],
    architecture:
      "Prompt bench → orchestrator → worker pool → scoring → report",
  },
  {
    slug: "openrouter-usage",
    repoName: "openrouter_usage",
    displayName: "OpenRouter Usage",
    tagline: "Workspace-aware OpenRouter org spend dashboard",
    description:
      "Agent Zero plugin for OpenRouter org spend analytics — per-key, per-model, and per-provider breakdowns, budgets, and routing recommendations.",
    category: "ai",
    type: "platform",
    featured: false,
    techStack: ["TypeScript", "OpenRouter", "Dashboard", "Analytics"],
    private: false,
    highlights: [
      "Per-key / model / provider spend breakdowns",
      "Budget and limit tracking",
      "Routing recommendations",
    ],
    architecture:
      "OpenRouter API → usage aggregation → budget engine → dashboard UI",
  },
  {
    slug: "a0-openrouter-spend",
    repoName: "a0-openrouter-spend",
    displayName: "A0 OpenRouter Spend",
    tagline: "OpenRouter spend and budget tracking utility",
    description:
      "OpenRouter spend tracking and budget analytics utility. Work-in-progress companion to the main OpenRouter Usage dashboard.",
    category: "finance",
    type: "experiment",
    featured: false,
    techStack: ["TypeScript", "OpenRouter", "Analytics"],
    private: false,
    highlights: [
      "OpenRouter spend tracking",
      "Budget analytics helpers",
      "Companion to OpenRouter Usage",
    ],
    architecture: "OpenRouter spend data → budget helpers → lightweight UI",
  },
  {
    slug: "dayflow-linux",
    repoName: "dayflow-linux",
    displayName: "Dayflow Linux",
    tagline: "Automatic local work journal for Linux",
    description:
      "Tracks your day on Linux and summarizes it with vision models via OpenRouter. Builds a private, timestamped work journal from desktop activity.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["Python", "OpenRouter", "Vision Models", "Linux"],
    private: false,
    highlights: [
      "Linux desktop activity journaling",
      "Vision-model daily summaries",
      "Private, local-first data",
    ],
    architecture:
      "Activity capture → vision summarizer → markdown journal → local store",
  },
  {
    slug: "dayflow-screenshots",
    repoName: "dayflow-screenshots",
    displayName: "Dayflow Screenshots",
    tagline: "Auto-rename and index Wayland screenshots",
    description:
      "Auto-rename and index Wayland screenshots with a vision model. Produces timestamped snake_case filenames plus a markdown catalog.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["Python", "OpenRouter", "Vision Models", "Wayland"],
    private: false,
    highlights: [
      "Automatic Wayland screenshot indexing",
      "Vision-generated snake_case filenames",
      "Markdown catalog output",
    ],
    architecture:
      "Screenshot watcher → vision model → file rename → markdown catalog",
  },
  {
    slug: "kurultai-people",
    repoName: "kurultai_people",
    displayName: "Kurultai People",
    tagline: "Agent Zero plugin for Kurultai Memory",
    description:
      "Agent Zero plugin that adds search, recall, and citation against the Kurultai knowledge index. Brings long-term memory into agent runs.",
    category: "ai",
    type: "app",
    featured: false,
    techStack: ["Python", "Kurultai", "Agent Zero", "Embeddings"],
    private: false,
    highlights: [
      "Kurultai knowledge search from agents",
      "Recall and citation pipeline",
      "Agent Zero plugin interface",
    ],
    architecture:
      "Agent Zero hook → Kurultai search → recall ranking → cited response",
  },
  {
    slug: "pace-grafana-dashboards",
    repoName: "pace-grafana-dashboards",
    displayName: "Pace Grafana Dashboards",
    tagline: "Grafana dashboards for Pace observability",
    description:
      "Grafana dashboard collection for Pace Server observability. Git-sync friendly slim repo with service-health and infrastructure panels.",
    category: "infra",
    type: "library",
    featured: false,
    techStack: ["Grafana", "Observability", "Git Sync"],
    private: false,
    highlights: [
      "Service health and infra panels",
      "Git-sync friendly dashboard as code",
      "Built for Pace Server",
    ],
    architecture:
      "Grafana JSON dashboards → Git sync → Pace observability stack",
  },
  {
    slug: "omaseal",
    repoName: "OmaSeal",
    displayName: "OmaSeal",
    tagline: "First-party keyring manager for Omarchy",
    description:
      "First-party keyring manager for the Omarchy environment. Securely stores and retrieves credentials for plugins and services.",
    category: "apps",
    type: "library",
    featured: false,
    techStack: ["TypeScript", "Omarchy", "Security", "Keyring"],
    private: false,
    highlights: [
      "First-party keyring for Omarchy",
      "Plugin credential store",
      "Secure retrieval API",
    ],
    architecture:
      "Keyring backend → encrypted store → plugin credential API → Omarchy UI",
  },
  {
    slug: "crucible",
    repoName: "crucible",
    displayName: "Crucible",
    tagline: "Experimental AI / LLM project",
    description:
      "Experimental AI/LLM project currently in active development. README and scope to be finalized; treated as a work-in-progress dossier.",
    category: "ai",
    type: "experiment",
    featured: false,
    techStack: ["Python", "LLM", "Experiment"],
    private: false,
    highlights: [
      "Active experimental AI work",
      "README and scope being finalized",
      "Dossier will expand as project matures",
    ],
    architecture: "TBD — follow README once scope is documented",
  },
  {
    slug: "openclaw-macmini-hardened",
    repoName: "openclaw-macmini-hardened",
    displayName: "OpenClaw Mac Mini Hardened",
    tagline: "Hardened OpenClaw deployment for Mac Mini M1",
    description:
      "Hardened macOS AI deployment on Mac Mini M1 — Docker, Tailscale SSH, Ollama, LiteLLM, memory review queue, audit logs, and cheap API routing.",
    category: "infra",
    type: "infra",
    featured: false,
    techStack: [
      "Docker",
      "Tailscale",
      "Ollama",
      "LiteLLM",
      "Mac Mini",
    ],
    private: true,
    highlights: [
      "Hardened M1 Mini AI host",
      "Tailscale SSH and Ollama/LiteLLM routing",
      "Audit logs and memory review queue",
    ],
    architecture:
      "Mac Mini host → Tailscale mesh → Docker runtime → Ollama + LiteLLM → audit queue",
  },
  {
    slug: "bartlett-permits",
    repoName: "bartlett-permits",
    displayName: "Bartlett Permits",
    tagline: "Permit operations platform for Bartlett Roofing",
    description:
      "Permit operations platform for Bartlett Roofing: map dashboard, SOP-first /ops cockpit, and automation sidecar. Express + React + FastAPI + PostgreSQL.",
    category: "apps",
    type: "platform",
    featured: false,
    techStack: ["Express", "React", "FastAPI", "PostgreSQL", "Maps"],
    private: true,
    highlights: [
      "Permit map dashboard and SOP cockpit",
      "Automation sidecar for permit workflows",
      "Multi-service Express/React/FastAPI stack",
    ],
    architecture:
      "Map UI → permit service → FastAPI workflows → PostgreSQL → automation sidecar",
  },
  {
    slug: "bartlett-data-platform",
    repoName: "bartlett-data-platform",
    displayName: "Bartlett Data Platform",
    tagline: "Agentic data platform for Bartlett Roofing",
    description:
      "Agentic data platform for Bartlett Roofing — ingestion, modeling, BI, and predictive analytics. Private production-adjacent system.",
    category: "data",
    type: "platform",
    featured: false,
    techStack: ["Python", "PostgreSQL", "BI", "Predictive Analytics"],
    private: true,
    highlights: [
      "Ingestion, modeling, and BI layers",
      "Predictive analytics for roofing ops",
      "Agentic data orchestration",
    ],
    architecture:
      "Ingestion → data warehouse → BI models → prediction service → reports",
  },
  {
    slug: "project-atlas",
    repoName: "project-atlas",
    displayName: "Project Atlas",
    tagline: "AI-powered operations backend for home service contractors",
    description:
      "AI operations backend for home service contractors — voice AI, CRM, automated follow-ups, and review automation. Private production system.",
    category: "ai",
    type: "platform",
    featured: false,
    techStack: ["Python", "Voice AI", "CRM", "Automation"],
    private: true,
    highlights: [
      "Voice AI and CRM for contractors",
      "Automated follow-up and review flows",
      "Production operations backend",
    ],
    architecture:
      "Voice AI → CRM → workflow engine → review automation → customer comms",
  },
  {
    slug: "helm-qmk-macropad",
    repoName: "helm-qmk-macropad",
    displayName: "Helm QMK Macropad",
    tagline: "6-key + 1-knob USB-C QMK macropad",
    description:
      "Helm is a 6-key + 1-knob USB-C QMK macropad. Includes CAD files, firmware, and the first working build.",
    category: "apps",
    type: "experiment",
    featured: false,
    techStack: ["QMK", "CAD", "Firmware", "Hardware"],
    private: true,
    highlights: [
      "6-key + knob QMK macropad",
      "CAD and firmware source",
      "Working hardware build",
    ],
    architecture:
      "Custom PCB → QMK firmware → USB-C HID → keymap + encoder logic",
  },
  {
    slug: "void-sleep",
    repoName: "void-sleep",
    displayName: "Void Sleep",
    tagline: "Personality-driven iOS sleep tracker",
    description:
      "A personality-driven iOS sleep tracker. The Void observes your sleep and judges accordingly. Private mobile experiment.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["Swift", "iOS", "HealthKit"],
    private: true,
    highlights: [
      "Personality-driven sleep insights",
      "iOS HealthKit integration",
      "Private mobile product experiment",
    ],
    architecture:
      "iOS app → HealthKit sleep data → personality engine → daily judgment UI",
  },
  {
    slug: "harbor-openrouter-ios-client",
    repoName: "harbor-openrouter-ios-client",
    displayName: "Harbor OpenRouter iOS Client",
    tagline: "Unofficial OpenRouter iOS client with BYOK",
    description:
      "Unofficial OpenRouter iOS client. BYOK, not affiliated with OpenRouter. Private mobile app project.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["Swift", "iOS", "OpenRouter", "BYOK"],
    private: true,
    highlights: [
      "OpenRouter chat interface on iOS",
      "Bring-your-own-key model",
      "Unofficial, private client",
    ],
    architecture: "iOS client → OpenRouter chat API → keyring → BYOK chat UI",
  },
];
