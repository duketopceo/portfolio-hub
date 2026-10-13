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
    slug: "omarchy-power",
    repoName: "omarchy-power",
    displayName: "Power",
    tagline: "Battery model + power profiles on the Omarchy bar",
    description:
      "Omarchy power plugin: battery percentage, charge state, and profile switching in the bar, backed by a small helper that reads /proc power data. Reworked battery model with consumer/history test coverage.",
    category: "apps",
    type: "library",
    featured: false,
    techStack: ["QML", "Omarchy", "Python", "systemd"],
    private: false,
    highlights: [
      "Bar battery state with profile switching",
      "Helper reads /proc directly — no heavyweight deps",
      "Listed on the official Omarchy plugin marketplace",
    ],
    architecture: "sysfs/power_supply reader → percent/state model → bar widget + panel",
  },
  {
    slug: "omarchy-connections",
    repoName: "omarchy-connections",
    displayName: "Connections",
    tagline: "Network connections at a glance on the Omarchy bar",
    description:
      "Omarchy plugin surfacing NetworkManager state — active connections, VPN, and signal details — as a bar widget with a dropdown panel.",
    category: "apps",
    type: "library",
    featured: false,
    techStack: ["QML", "Omarchy", "NetworkManager"],
    private: false,
    highlights: [
      "Active connection + VPN status in the bar",
      "Dropdown panel for detail",
      "Listed on the official Omarchy plugin marketplace",
    ],
    architecture: "nmcli probe → connection model → bar widget + panel",
  },
  {
    slug: "omarchy-numbat",
    repoName: "omarchy-numbat",
    displayName: "Numbat",
    tagline: "AI-agent activity radar — Perplexity numbat findings on the bar",
    description:
      "Bar widget + panel over Perplexity's open-source numbat agentic monitor. Severity-gated toasts on new findings only (with per-rule cooldowns, burst coalescing, DND suppression), unseen-count badge, agent filters, and a rotation hint for the unbounded records file.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["QML", "Omarchy", "Python", "Numbat"],
    private: false,
    highlights: [
      "Severity-gated toasts — quiet by default, critical stays until clicked",
      "Per-rule cooldown + burst coalescing keeps alerts honest",
      "Read-only: tails records.ndjson, never writes to the monitor",
      "Listed on the official Omarchy plugin marketplace",
    ],
    architecture:
      "numbat records tail → findings feed (1MiB bounded tail) → severity gate → toasts + panel",
  },
  {
    slug: "omarchy-bumblebee",
    repoName: "omarchy-bumblebee",
    displayName: "Bumblebee",
    tagline: "Supply-chain exposure radar — scans against a compromise catalog",
    description:
      "Omarchy plugin over Perplexity's bumblebee scanner: diffs installed packages and lockfiles against a known-compromise catalog, auto-refreshes on staleness, and toasts only on NEW exposures — muted exposures stay visible but silent.",
    category: "apps",
    type: "library",
    featured: false,
    techStack: ["QML", "Omarchy", "Python", "Security"],
    private: false,
    highlights: [
      "New-exposure-only toasts — silent when clean",
      "Catalog auto-refresh with staleness probe",
      "Mute list keeps accepted exposures visible but quiet",
      "Listed on the official Omarchy plugin marketplace",
    ],
    architecture:
      "bumblebee scan → catalog diff → severity-tagged exposure rows → toasts + panel",
  },
  {
    slug: "omarchy-neo",
    repoName: "omarchy-neo",
    displayName: "Neo",
    tagline: "BrowserOS neo agent-browser control on the Omarchy bar",
    description:
      "Bar status + controls for a BrowserOS neo sidecar stack: per-unit restart, port map, MCP endpoint health, and live open-tab count from the CDP shim.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["QML", "Omarchy", "Python", "CDP", "systemd"],
    private: false,
    highlights: [
      "Per-unit start/stop/restart with whitelisted verbs",
      "Live open-tab count via CDP shim /json/list",
      "MCP endpoint health in the panel",
    ],
    architecture:
      "systemd --user probes + loopback CDP shim → status payload → bar widget + control panel",
  },
  {
    slug: "omarchy-pplx",
    repoName: "omarchy-pplx",
    displayName: "PPLX",
    tagline: "Perplexity quick-ask search in a bar dropdown",
    description:
      "Omarchy plugin for the pplx CLI + Search API: type, enter, grounded results with sources, recency/context chips, one-click copy, BYOK via env or keyring.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["QML", "Omarchy", "pplx CLI", "Perplexity"],
    private: false,
    highlights: [
      "Grounded answers with source links",
      "Recency + context chips",
      "BYOK — env or keyring",
      "Listed on the official Omarchy plugin marketplace",
    ],
    architecture: "QML dropdown → pplx CLI → Search API → rendered results + copy",
  },
  {
    slug: "omarchy-wisp",
    repoName: "omarchy-wisp",
    displayName: "Wisp Shell",
    tagline: "Voice companion surface — orb, ghost cursor, agent panel",
    description:
      "Omarchy shell plugin for Wisp, the resident voice companion: renders wispd's live state as a companion orb with mode badge, cursor-adjacent answer bubble, listening pill, ghost cursor, and a full agent/telemetry panel.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["QML", "Omarchy", "whisper.cpp", "MCP"],
    private: false,
    highlights: [
      "Companion orb + ghost cursor + listening pill overlays",
      "Panel with Now/Agents/Activity/Telemetry/Skills tabs",
      "Pairs with wispd — push-to-talk voice → routed agent actions",
    ],
    architecture: "wispd state.json → shell widgets (orb/bubble/pill/cursor) + panel",
  },
  {
    slug: "omarchy-plugins",
    repoName: "omarchy-plugins",
    displayName: "Omarchy Plugins",
    tagline: "Umbrella catalog + subtree publisher for 11 bar plugins",
    description:
      "Authoring catalog and publish pipeline for the Omarchy plugin estate — hardware (fan, power), markets (ticker), AI-agent surfaces (agents, numbat, bumblebee, neo, pplx, wisp shell), and overlays (standby, nexus, connections). Each plugin subtree-publishes to its own repo for `omarchy plugin add`; most are listed on the official marketplace.",
    category: "apps",
    type: "library",
    featured: false,
    techStack: ["QML", "TypeScript", "Omarchy", "Plugins", "pytest"],
    private: false,
    highlights: [
      "11 published plugins, one manifest-validated catalog",
      "Subtree-publish keeps one-repo-per-plugin compatibility",
      "Toast correctness layer: severity gates, cooldowns, burst coalescing, DND",
      "275-test suite covering helpers and manifest schema",
    ],
    architecture:
      "Umbrella catalog → per-plugin subtrees → `omarchy plugin add` repos → marketplace listings",
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
    slug: "dayflow-screenshots",
    repoName: "snapdex", // renamed from dayflow-screenshots
    displayName: "Snapdex",
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
  {
    slug: "pixel-tycoon",
    repoName: "pixel-tycoon",
    displayName: "Pixel Tycoon",
    tagline:
      "Godot 4.7 city-block tycoon — instrumented like a service: perf baselines, regression gates, capture reels",
    description:
      "2D top-down city-block tycoon built in Godot 4.7 (GDScript): run shops, buy property, day/night cycle, weather states, NPCs, save/load. Engineered with a dev-end spine — EventBus autoloads, JSON-driven modular buildings, an EconomyMath library, integer-cent money, and a headless perf harness that writes per-resolution baselines and fails regressions past explicit thresholds.",
    category: "apps",
    type: "app",
    featured: false,
    demoUrl: "/demos/pixel-tycoon",
    planetVisual: {
      size: "md",
      shape: "cube",
      color: "#4ADE80",
      rings: [{ opacity: 0.3, tilt: -18 }],
      moons: [
        { label: "Godot 4.7", kind: "stack" },
        { label: "Perf gate", kind: "stack" },
      ],
    },
    techStack: ["GDScript", "Godot 4.7", "Python", "EventBus", "JSON data"],
    private: false,
    highlights: [
      "Headless perf harness — per-resolution FPS/frame/memory/load baselines",
      "Regression gate with explicit pass thresholds on every change",
      "JSON-driven modular buildings (BuildingZone + data rows)",
      "Day/night cycle, four weather states, occlusion pass",
    ],
    architecture:
      "Godot scenes → EventBus autoloads → JSON building data → EconomyMath lib → headless perf harness → regression diff",
  },

  /* ------------------------------------------------------------------ *
   * 2026-10-12 audition batch — entries that cleared the setup bar and were
   * not already catalogued. Selected by scripts/audit-repo-audition.py
   * (judged on commits and files, not existence). See docs/CATALOG-AUDIT.md
   * ------------------------------------------------------------------ */

  {
    slug: "open-military-hardware-db",
    repoName: "open-military-hardware-db",
    displayName: "Open Military Hardware DB",
    tagline: "Open-source database of military hardware across air, land, sea, and munitions",
    description:
      "Comprehensive open-source military hardware database covering weapons systems across air, land, sea, and munitions categories, with specifications, economics, operational history, and media references.",
    category: "osint",
    type: "platform",
    featured: false,
    techStack: ["TypeScript", "Python", "FastAPI", "SQLite", "Open Data"],
    private: false,
    highlights: [
      "Structured weapons-systems data across four domains",
      "Specifications plus programme economics and operational history",
      "Media references and open-data provenance",
      "Highest-traction repository on the account",
    ],
    architecture:
      "Open data sources → ingestion → FastAPI service → SQLite store → typed query API",
  },
  {
    slug: "wisp",
    repoName: "wisp",
    displayName: "Wisp",
    tagline: "Push-to-talk voice computer-use agent for Omarchy, decided by Jev",
    description:
      "Jev-powered voice computer-use agent for Omarchy on Hyprland and Asahi. Push-to-talk feeds whisper.cpp, Jev returns a typed decision, and the result drives a guarded hyprctl launch with a breathing dim overlay.",
    category: "ai",
    type: "app",
    featured: false,
    techStack: ["Python", "Jev", "whisper.cpp", "PipeWire", "Hyprland", "Omarchy"],
    private: false,
    highlights: [
      "Push-to-talk voice control of the desktop",
      "Typed decision model rather than free-text prompting",
      "Guarded launch path — actions are gated, not freeform",
      "Breathing dim overlay for visible agent state",
    ],
    architecture:
      "Push-to-talk → whisper.cpp transcription → Jev typed decision → guarded hyprctl launch → dim overlay",
  },
  {
    slug: "open-computer",
    repoName: "open-computer",
    displayName: "Open Computer",
    tagline: "Open-source multi-model computer-use agent with disposable sandboxes",
    description:
      "Open-source equivalent of a cloud computer-use agent: multi-model routing, disposable sandboxed execution, and hybrid local/cloud placement.",
    category: "ai",
    type: "platform",
    featured: false,
    techStack: ["Python", "Sandboxing", "Multi-Model Routing"],
    private: false,
    highlights: [
      "Multi-model routing across providers",
      "Disposable sandboxed execution per task",
      "Hybrid local and cloud placement",
    ],
    architecture: "Task intake → model routing → disposable sandbox → execution → result capture",
  },
  {
    slug: "agentflow",
    repoName: "agentflow",
    displayName: "AgentFlow",
    tagline: "Script-driven multi-agent orchestration across harnesses",
    description:
      "Cross-harness dynamic workflows: script-driven multi-agent orchestration spanning Devin, Claude Code, Codex, and OpenCode, with plugins for each.",
    category: "ai",
    type: "platform",
    featured: false,
    techStack: ["JavaScript", "Multi-Agent", "Claude Code", "Codex", "OpenCode"],
    private: false,
    highlights: [
      "One workflow definition drives multiple agent harnesses",
      "Script-driven rather than prompt-driven orchestration",
      "Per-harness plugin adapters",
    ],
    architecture: "Workflow script → harness adapter → agent execution → step results → next step",
  },
  {
    slug: "tallyline",
    repoName: "tallyline",
    displayName: "Tallyline",
    tagline: "Self-hostable, agent-native issue tracker where humans and agents share one board",
    description:
      "Self-hostable, agent-native issue tracker — MIT-licensed Linear-class UX where humans and AI agents work the same board.",
    category: "apps",
    type: "platform",
    featured: false,
    techStack: ["TypeScript", "MIT", "Self-Hosted"],
    private: false,
    highlights: [
      "Humans and agents operate the same board",
      "Linear-class interface, MIT licensed",
      "Self-hostable with no vendor dependency",
    ],
    architecture: "Web board → issue store → agent API surface → human and agent actors on one model",
  },
  {
    slug: "openrouter-demos",
    repoName: "openrouter-demos",
    displayName: "OpenRouter Demos",
    tagline: "Support deflection, GTM motion, and a three-model bakeoff",
    description:
      "Working demonstrations built on OpenRouter: a support-deflection flow, a go-to-market motion, and a multi-model bakeoff with cost, latency, and quality measured per candidate.",
    category: "ai",
    type: "app",
    featured: false,
    techStack: ["Python", "OpenRouter", "LLM Evals", "Tool Calling"],
    private: false,
    highlights: [
      "Multi-model bakeoff with measured cost and quality",
      "Support-deflection workflow",
      "GTM motion workflow",
      "Built directly on the OpenRouter API",
    ],
    architecture: "Task fixtures → per-model runs → cost/latency/quality capture → bakeoff report",
  },
  {
    slug: "wordink",
    repoName: "WordInk",
    displayName: "WordInk",
    tagline: "Speech-to-text dictation on Groq's inference API",
    description:
      "AI-powered speech-to-text dictation — an alternative to hosted dictation tools, built on Groq's low-latency inference API.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "Python", "Groq", "Whisper"],
    private: false,
    highlights: [
      "Low-latency dictation over a fast inference API",
      "Client SDK plus app",
    ],
    architecture: "Audio capture → Groq transcription → text insertion",
  },
  /* a0-plugin-* — Agent Zero plugin suite */

  {
    slug: "a0-plugin-argus",
    repoName: "a0-plugin-argus",
    displayName: "Agent Zero Plugin — Argus",
    tagline: "Pull-request review tools for Agent Zero, backed by Argus",
    description:
      "Agent Zero plugin adding argus_review and argus_flow tools, backed by Argus, a self-hosted bring-your-own-key pull-request reviewer.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["Python", "Agent Zero", "Argus", "Code Review"],
    private: false,
    highlights: [
      "Exposes review and flow tools to an Agent Zero runtime",
      "Bring-your-own-key, self-hosted",
    ],
    architecture: "Agent Zero tool call → plugin adapter → Argus reviewer → findings",
  },
  {
    slug: "a0-plugin-omaseal",
    repoName: "a0-plugin-omaseal",
    displayName: "Agent Zero Plugin — OmaSeal",
    tagline: "One secrets interface for Agent Zero, with masked values only",
    description:
      "One secrets interface for Agent Zero. Resolves keys through the OmaSeal keyring, 1Password, environment, or an encrypted vault; agents see names and masked values only.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["Python", "Agent Zero", "OmaSeal", "1Password", "Secrets"],
    private: false,
    highlights: [
      "Single resolution path across four secret backends",
      "Agents never receive plaintext values",
      "Keyring, 1Password, env, and encrypted vault support",
    ],
    architecture: "Agent request → secret resolver → backend (keyring/1Password/env/vault) → masked value",
  },
  {
    slug: "a0-plugin-jev-compact",
    repoName: "a0-plugin-jev-compact",
    displayName: "Agent Zero Plugin — Jev Compact",
    tagline: "Jev-scored context compaction with tombstone restore",
    description:
      "Agent Zero plugin for context compaction scored by Jev, with tombstone restore so compacted context can be recovered rather than lost.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["Python", "Agent Zero", "Jev", "Context Management"],
    private: false,
    highlights: [
      "Decision-model scoring drives what gets compacted",
      "Tombstone restore for compacted spans",
    ],
    architecture: "Context window → Jev span scoring → compaction → tombstone store → restore",
  },
  {
    slug: "a0-plugin-device-sync",
    repoName: "a0-plugin-device-sync",
    displayName: "Agent Zero Plugin — Device Sync",
    tagline: "Cross-instance settings, chat, and memory sync over Tailscale",
    description:
      "Cross-instance sync packs for Agent Zero covering settings, chat, and memory, transported over Tailscale and carrying no secrets.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["Python", "Agent Zero", "Tailscale", "Sync"],
    private: false,
    highlights: [
      "Settings, chat, and memory kept in sync across instances",
      "Tailscale transport with no secrets in the payload",
    ],
    architecture: "Instance state → sync pack → Tailscale transport → peer instance apply",
  },
  {
    slug: "a0-plugin-durable",
    repoName: "a0-plugin-durable",
    displayName: "Agent Zero Plugin — Durable Tasks",
    tagline: "Restart-survivable agent tasks with a zero-dependency journal",
    description:
      "Agent Zero plugin making agent tasks durable and restart-survivable: a zero-dependency SQLite journal engine with an optional Restate adapter.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["Python", "Agent Zero", "SQLite", "Durability"],
    private: false,
    highlights: [
      "Tasks survive process restarts",
      "Zero-dependency SQLite journal",
      "Optional Restate adapter for stronger guarantees",
    ],
    architecture: "Task start → SQLite journal append → restart → journal replay → resume",
  },
  {
    slug: "a0-plugin-glitchtip",
    repoName: "a0-plugin-glitchtip",
    displayName: "Agent Zero Plugin — GlitchTip",
    tagline: "Error tracking with request-ID and trace correlation",
    description:
      "Agent Zero plugin wiring GlitchTip error tracking into agent runs, correlating errors with request IDs and OpenTelemetry traces.",
    category: "infra",
    type: "library",
    featured: false,
    techStack: ["Python", "Agent Zero", "GlitchTip", "OpenTelemetry"],
    private: false,
    highlights: [
      "Errors correlated to request IDs",
      "OpenTelemetry trace correlation",
    ],
    architecture: "Agent run → error capture → GlitchTip → request-ID and trace correlation",
  },
  {
    slug: "a0-plugin-notion",
    repoName: "a0-plugin-notion",
    displayName: "Agent Zero Plugin — Notion",
    tagline: "Local Notion stdio MCP server with ingestion atoms",
    description:
      "Notion connector plugin for Agent Zero: a local stdio MCP server plus ingestion atoms for pulling Notion content into an agent's reach.",
    category: "ai",
    type: "library",
    featured: false,
    techStack: ["Python", "Agent Zero", "MCP", "Notion"],
    private: false,
    highlights: [
      "Runs as a local stdio MCP server",
      "Ingestion atoms for Notion content",
    ],
    architecture: "Agent Zero → local stdio MCP server → Notion API → ingestion atoms",
  },
  /* Personal */

  {
    slug: "kate",
    repoName: "kate",
    displayName: "Kate",
    tagline: "Private two-person hub for plans, to-dos, and a what-we-did log",
    description:
      "Private two-person hub covering camping, movies, and to-dos, with a what-we-did log and optional voice journaling.",
    category: "apps",
    type: "app",
    featured: false,
    techStack: ["TypeScript", "Voice"],
    private: true,
    highlights: [
      "Shared to-do and plans surface",
      "What-we-did log",
      "Optional voice journaling",
    ],
    architecture: "Client UI → entries store → shared log → optional voice capture",
  },
];
