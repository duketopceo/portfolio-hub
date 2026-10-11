import type { ProjectConfig } from "@/lib/types";

/** Slugs kept off homepage orbits and grouped in the archive registry section. */
export const CATALOG_ARCHIVE_SLUGS = [
  "alphahedge",
  "ikbr-dashboard",
  "finance-frenzy",
  "skyguard-ai",
  "quiz-the-best",
  "republic-atlas",
  "series65-study-app",
  "chronicle-weaver",
  "collaborative-essay",
  "curious-storycard",
  "ai-debate-arena",
  "trading-bot",
  "optimezer",
  "etl-pipeline",
  "project-atlas",
  "void-sleep",
] as const;

const ARCHIVE_SLUG_SET = new Set<string>(CATALOG_ARCHIVE_SLUGS);

export function isCatalogArchived(project: {
  slug: string;
  catalogArchive?: boolean;
  repoArchived?: boolean;
}): boolean {
  return (
    project.catalogArchive === true ||
    project.repoArchived === true ||
    ARCHIVE_SLUG_SET.has(project.slug)
  );
}

export function partitionCatalogProjects<T extends ProjectConfig>(
  projects: T[]
): { active: T[]; archived: T[] } {
  const active: T[] = [];
  const archived: T[] = [];
  for (const p of projects) {
    if (isCatalogArchived(p)) archived.push(p);
    else active.push(p);
  }
  return { active, archived };
}
