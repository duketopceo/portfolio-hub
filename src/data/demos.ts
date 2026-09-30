/** Demo bay registry — each entry is a portfolio-hub demo surface. */
export type DemoTier = "replay" | "live" | "planned";

export interface DemoEntry {
  slug: string;
  name: string;
  projectSlug?: string;
  tier: DemoTier;
  /** One-line demo premise. */
  tagline: string;
  href: string;
  external?: boolean;
}

export const demos: DemoEntry[] = [
  {
    slug: "argus",
    name: "Argus",
    projectSlug: "argus",
    tier: "replay",
    tagline:
      "Cost-metered vision E2E + shipped review surface — dollar ledger replay, formal GitHub reviews, real PR capture.",
    href: "/demos/argus",
  },
  {
    slug: "pixel-tycoon",
    name: "Pixel Tycoon",
    projectSlug: "pixel-tycoon",
    tier: "replay",
    tagline:
      "Godot 4.7 city-block tycoon — headless perf baseline + regression gate ledger, day/night/weather capture reel.",
    href: "/demos/pixel-tycoon",
  },
  {
    slug: "kurultai",
    name: "Kurultai",
    projectSlug: "kurultai",
    tier: "replay",
    tagline:
      "Knowledge-brain API replay — real /api/search and /api/status responses captured from a public-docs demo corpus.",
    href: "/demos/kurultai",
  },
  {
    slug: "openrouter",
    name: "OpenRouter Demos",
    projectSlug: "openrouter",
    tier: "replay",
    tagline:
      "Four eval-driven application demos — Deflect, Motion, Bakeoff, Caesar — fixture summaries and smoke tests.",
    href: "/openrouter",
  },
  {
    slug: "pace-server",
    name: "Pace Server",
    projectSlug: "pace-server",
    tier: "live",
    tagline:
      "Production platform — gateway, auth, and Stripe billing live at pacehq.io.",
    href: "https://pacehq.io",
    external: true,
  },
  {
    slug: "ai-debate-arena",
    name: "AI Debate Arena",
    projectSlug: "ai-debate-arena",
    tier: "planned",
    tagline:
      "Two-model debate replay with concession traces — capture pending.",
    href: "/projects/ai-debate-arena",
  },
  {
    slug: "dayflow-linux",
    name: "Dayflow",
    tier: "planned",
    tagline:
      "Desktop timeline widget — QML surface; screenshot panel pending.",
    href: "https://github.com/duketopceo/dayflow-linux",
    external: true,
  },
];
