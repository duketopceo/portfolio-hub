import { categoryMeta } from "@/data/category-meta";
import { categoryGroups } from "@/lib/ranking-core";
import type { EnrichedProject } from "@/lib/types";
import ProjectCard from "./ProjectCard";

/**
 * The ranked projects after the lead block, grouped by category. Groups
 * appear in order of their best-ranked project; cards keep rank order.
 * `registrySlugs` (catalog order) supplies each project's stable CI number.
 */
export default function CategoryGroups({
  ranked,
  registrySlugs,
}: {
  ranked: readonly EnrichedProject[];
  registrySlugs: readonly string[];
}) {
  const groups = categoryGroups(ranked);
  const registryIndex = new Map(registrySlugs.map((slug, i) => [slug, i] as const));
  return (
    <div className="category-groups">
      {groups.map((g) => {
        const meta = categoryMeta[g.category];
        const id = `group-${g.category}`;
        return (
          <section key={g.category} className="category-group" aria-labelledby={id}>
            <header className="category-group__head">
              <h3 id={id} className="category-group__title">
                {meta?.label ?? g.category}
              </h3>
              <span className="category-group__count">{g.projects.length}</span>
            </header>
            <div className="catalog-grid">
              {g.projects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  registryIndex={registryIndex.get(project.slug) ?? -1}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
