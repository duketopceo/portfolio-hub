/**
 * Format a date string into a human-readable relative or absolute format.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Language → color mapping for badges.
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
 * Get the GitHub URL for a public repo.
 */
export function getGitHubUrl(repoName: string): string {
  return `https://github.com/duketopceo/${repoName}`;
}

/**
 * Category colors for badges/filters.
 */
export const categoryColors: Record<string, string> = {
  finance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ai: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  osint: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  data: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  infra: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  apps: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

export const categoryColorsLight: Record<string, string> = {
  finance: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ai: "bg-violet-50 text-violet-700 border-violet-200",
  osint: "bg-amber-50 text-amber-700 border-amber-200",
  data: "bg-blue-50 text-blue-700 border-blue-200",
  infra: "bg-rose-50 text-rose-700 border-rose-200",
  apps: "bg-teal-50 text-teal-700 border-teal-200",
};
