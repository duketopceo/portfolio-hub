import { categoryMeta } from "@/data/category-meta";
import { categoryGroups } from "@/lib/ranking-core";
import type { EnrichedProject } from "@/lib/types";
import ProjectCard from "./ProjectCard";

/**
 * The ranked projects after the lead block, grouped by category. Groups
 * appear in order of their best-ranked project; cards keep rank order.
 * `registry` supplies each project's stable CI number.
 */
export default function CategoryGroups({
  ranked,
  registry,
}: {
  ranked: readonly EnrichedProject[];
  registry: readonly EnrichedProject[];
}) {
  const groups = categoryGroups(ranked);
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
                  registryIndex={registry.findIndex((p) => p.slug === project.slug)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
