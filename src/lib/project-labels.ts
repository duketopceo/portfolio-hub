import type { EnrichedProject } from "./types";
import { isProjectLive } from "./deployments";

const MS_DAY = 86_400_000;

function isRecent(isoDate: string, days: number): boolean {
  const t = new Date(isoDate).getTime();
  if (Number.isNaN(t)) return false;
  return (Date.now() - t) / MS_DAY <= days;
}

export type ProjectStatusLabel = "Live" | "OSS" | "Recent" | "SaaS" | "Platform" | "Tool" | "App" | "AI";

export function getProjectLabels(p: EnrichedProject): ProjectStatusLabel[] {
  const labels: ProjectStatusLabel[] = [];

  const type = (p.type ?? "").trim();
  if (type) {
    const display = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    if (["SaaS", "Platform", "Tool", "App", "AI"].includes(display)) {
      labels.push(display as ProjectStatusLabel);
    }
  }

  if (!p.private) labels.push("OSS");
  if (isProjectLive(p)) labels.push("Live");
  if (p.lastUpdated && isRecent(p.lastUpdated, 90)) labels.push("Recent");

  return labels;
}
