import { categoryMeta } from "@/data/category-meta";
import { categoryGroups } from "@/lib/ranking-core";
import type { EnrichedProject } from "@/lib/types";
import Link from "next/link";
import ProjectCard from "./ProjectCard";

/**
 * The ranked projects after the lead block, grouped by category. Groups
 * appear in order of their best-ranked project; cards keep rank order.
 * `registrySlugs` (catalog order) supplies each project's stable CI number.
 */
export default function CategoryGroups({
  ranked,
  registrySlugs,
  limit,
}: {
  ranked: readonly EnrichedProject[];
  registrySlugs: readonly string[];
  /** Show only each group's first `limit` projects, with a link to the full category. */
  limit?: number;
}) {
  const groups = categoryGroups(ranked);
  // The category's full size, lead projects included, matches the /projects filter count.
  const total = (category: string) => ranked.filter((p) => p.category === category).length;
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
              {(limit === undefined ? g.projects : g.projects.slice(0, limit)).map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  registryIndex={registryIndex.get(project.slug) ?? -1}
                />
              ))}
            </div>
            {limit !== undefined && (
              <Link
                href={`/projects?category=${g.category}`}
                className="category-group__more detail-nav-link"
                prefetch={false}
                data-umami-event="home-see-all"
                data-umami-event-category={g.category}
              >
                See all {total(g.category)} in {meta?.label ?? g.category} →
              </Link>
            )}
          </section>
        );
      })}
    </div>
  );
}
