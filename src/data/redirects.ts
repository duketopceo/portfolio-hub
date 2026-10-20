/**
 * Retired project slugs. Every slug that has ever had a dossier on `main`
 * keeps resolving, in one hop (KTD3). `src/lib/catalog.test.ts` checks that
 * each `from` is no longer a listed slug and each `to` resolves.
 *
 * - merged component  -> `/projects/<parent>`
 * - removed entry     -> `/projects`
 * - earlier work      -> `/projects#earlier-work`
 */
export interface RetiredSlug {
  from: string;
  to: string;
  reason: "merged" | "removed" | "earlier" | "duplicate";
}

export const retiredSlugs: RetiredSlug[] = [
  { from: "omarchy-fan", to: "/projects/omarchy-plugins", reason: "merged" },
  { from: "omarchy-numbat", to: "/projects/omarchy-plugins", reason: "merged" },
  { from: "omarchy-standby", to: "/projects/omarchy-plugins", reason: "merged" },
  { from: "omarchy-ticker", to: "/projects/omarchy-plugins", reason: "merged" },
  { from: "omarchy-bumblebee", to: "/projects/omarchy-plugins", reason: "merged" },
  { from: "omarchy-pplx", to: "/projects/omarchy-plugins", reason: "merged" },
  { from: "omarchy-nexus", to: "/projects/omarchy-plugins", reason: "merged" },
  { from: "omarchy-agents", to: "/projects/omarchy-plugins", reason: "merged" },
  { from: "omarchy-power", to: "/projects/omarchy-plugins", reason: "merged" },
  { from: "omarchy-connections", to: "/projects/omarchy-plugins", reason: "merged" },
  { from: "omarchy-wisp", to: "/projects/wisp", reason: "merged" },
  { from: "kate-ios", to: "/projects/kate", reason: "merged" },
  { from: "kurultai-people", to: "/projects/kurultai", reason: "merged" },
  { from: "a0-openrouter-spend", to: "/projects/openrouter-usage", reason: "merged" },
  { from: "a0-plugin-argus", to: "/projects/agent-zero-plugins", reason: "merged" },
  { from: "a0-plugin-omaseal", to: "/projects/agent-zero-plugins", reason: "merged" },
  { from: "a0-plugin-jev-compact", to: "/projects/agent-zero-plugins", reason: "merged" },
  { from: "a0-plugin-device-sync", to: "/projects/agent-zero-plugins", reason: "merged" },
  { from: "a0-plugin-durable", to: "/projects/agent-zero-plugins", reason: "merged" },
  { from: "a0-plugin-glitchtip", to: "/projects/agent-zero-plugins", reason: "merged" },
  { from: "a0-plugin-notion", to: "/projects/agent-zero-plugins", reason: "merged" },
  { from: "openrouter", to: "/projects/openrouter-demos", reason: "duplicate" },
  { from: "open-military-hardware-db", to: "/projects/military-hardware-db", reason: "duplicate" },
  { from: "ai-debate-arena", to: "/projects#earlier-work", reason: "earlier" },
  { from: "trading-bot", to: "/projects#earlier-work", reason: "earlier" },
  { from: "alphahedge", to: "/projects#earlier-work", reason: "earlier" },
  { from: "ikbr-dashboard", to: "/projects#earlier-work", reason: "earlier" },
  { from: "finance-frenzy", to: "/projects#earlier-work", reason: "earlier" },
  { from: "skyguard-ai", to: "/projects#earlier-work", reason: "earlier" },
  { from: "quiz-the-best", to: "/projects#earlier-work", reason: "earlier" },
  { from: "optimezer", to: "/projects#earlier-work", reason: "earlier" },
  { from: "republic-atlas", to: "/projects#earlier-work", reason: "earlier" },
  { from: "etl-pipeline", to: "/projects#earlier-work", reason: "earlier" },
  { from: "series65-study-app", to: "/projects#earlier-work", reason: "earlier" },
  { from: "chronicle-weaver", to: "/projects#earlier-work", reason: "earlier" },
  { from: "collaborative-essay", to: "/projects#earlier-work", reason: "earlier" },
  { from: "curious-storycard", to: "/projects#earlier-work", reason: "earlier" },
  { from: "project-atlas", to: "/projects#earlier-work", reason: "earlier" },
  { from: "void-sleep", to: "/projects#earlier-work", reason: "earlier" },
  { from: "nem-stock-pitch", to: "/projects", reason: "removed" },
  { from: "dayflow-screenshots", to: "/projects", reason: "removed" },
  { from: "server-cluster", to: "/projects", reason: "removed" },
  { from: "omarchy-neo", to: "/projects", reason: "removed" },
  { from: "bartlett-data-platform", to: "/projects", reason: "removed" },
  { from: "pace-grafana-dashboards", to: "/projects", reason: "removed" },
  { from: "luke-the-duke-show", to: "/projects", reason: "removed" },
  { from: "openclaw-macmini-hardened", to: "/projects", reason: "removed" },
  { from: "stratum-hq", to: "/projects", reason: "removed" },
];

/** Next.js `redirects()` entries for the retired slugs (308). */
export function retiredSlugRedirects(
  list: RetiredSlug[] = retiredSlugs
): Array<{ source: string; destination: string; permanent: true }> {
  return list.map((r) => ({
    source: `/projects/${r.from}`,
    destination: r.to,
    permanent: true as const,
  }));
}
