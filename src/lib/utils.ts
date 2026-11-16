/**
 * Format a date string into an absolute human-readable format.
 * Uses absolute dates ("Mar 19, 2026") to avoid stale relative dates on ISR pages.
 */
/** Month-and-year stamp for "Updated Oct 2026" labels. Stable across renders. */
export function formatMonthYear(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

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
 * Language dot colours. The language is always named beside the dot, so the dot
 * carries no hue: every language is the same neutral grey (2026-11-15 palette:
 * no GitHub brand blues, greens or purples).
 */
export const LANGUAGE_DOT = "#B8B8B8";
export const languageColors: Record<string, string> = {
  Python: LANGUAGE_DOT,
  TypeScript: LANGUAGE_DOT,
  JavaScript: LANGUAGE_DOT,
  Shell: LANGUAGE_DOT,
  R: LANGUAGE_DOT,
  "Jupyter Notebook": LANGUAGE_DOT,
  GDScript: LANGUAGE_DOT,
  HTML: LANGUAGE_DOT,
  CSS: LANGUAGE_DOT,
  Rust: LANGUAGE_DOT,
  Go: LANGUAGE_DOT,
  Java: LANGUAGE_DOT,
};

/**
 * Category-to-accent-color mapping used across navigation, cards, and graphs.
 * Every category is white: groups and categories are told apart by name and
 * position, never by colour (2026-11-15).
 */
export const catColors: Record<string, string> = {
  finance: "#FFFFFF",
  ai: "#FFFFFF",
  osint: "#FFFFFF",
  data: "#FFFFFF",
  infra: "#FFFFFF",
  apps: "#FFFFFF",
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
