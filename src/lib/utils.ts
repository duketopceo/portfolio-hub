/**
 * Format a date string into a human-readable relative format.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
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
