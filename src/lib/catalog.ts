import { projectConfigs } from "@/data/projects";
import { isListedProject } from "@/lib/catalog-filter";
import type { ProjectConfig } from "@/lib/types";

export { isListedProject };

/** Entries that get a dossier and homepage/grid placement. Every consumer that
 *  iterates the catalog reads through here so filtering lives in one place. */
export function listedProjects(
  configs: ProjectConfig[] = projectConfigs
): ProjectConfig[] {
  return configs.filter(isListedProject);
}

/** Components of a parent entry, in catalog order. One level only. */
export function componentsOf(
  slug: string,
  configs: ProjectConfig[] = projectConfigs
): ProjectConfig[] {
  return configs.filter((p) => p.parentSlug === slug);
}

/** Entries on the "earlier work" list (no dossier). */
export function earlierWork(
  configs: ProjectConfig[] = projectConfigs
): ProjectConfig[] {
  return configs.filter((p) => p.era === "earlier");
}

/** Catalog invariants; returns human-readable problems (empty when valid). */
export function validateCatalog(
  configs: ProjectConfig[] = projectConfigs
): string[] {
  const problems: string[] = [];
  const bySlug = new Map(configs.map((p) => [p.slug, p]));
  for (const p of configs) {
    if (!p.parentSlug) continue;
    const parent = bySlug.get(p.parentSlug);
    if (!parent) {
      problems.push(`${p.slug}: parentSlug "${p.parentSlug}" is not in the catalog`);
      continue;
    }
    if (parent.parentSlug) {
      problems.push(`${p.slug}: parent "${parent.slug}" is itself a component`);
    }
    if (p.private && !parent.private) {
      problems.push(`${p.slug}: private component under public parent "${parent.slug}"`);
    }
  }
  return problems;
}
