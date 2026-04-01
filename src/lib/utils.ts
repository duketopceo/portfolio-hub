/**
 * Format a date string into an absolute human-readable format.
 * Uses absolute dates ("Mar 19, 2026") to avoid stale relative dates on ISR pages.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Language color mapping for badges.
 */
export const languageColors: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Shell: "#89E051",
  R: "#198CE7",
  "Jupyter Notebook": "#DA5B0B",
  GDScript: "#355570",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Java: "#B07219",
};

/**
 * Category-to-accent-color mapping used across navigation, cards, and graphs.
 */
export const catColors: Record<string, string> = {
  finance: "#2DD4BF",
  ai: "#A78BFA",
  osint: "#FBBF24",
  data: "#38BDF8",
  infra: "#F472B6",
  apps: "#34D399",
};

/**
 * Category icon component names (SVG-based, no emoji).
 */
export const categoryIcons: Record<string, string> = {
  finance: "chart",
  ai: "cpu",
  osint: "search",
  data: "database",
  infra: "server",
  apps: "globe",
};
