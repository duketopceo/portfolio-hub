
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
