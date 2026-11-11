import { capabilityMeta, isCapabilityId } from "@/data/capability-meta";
import { capabilityGroups } from "@/lib/ranking-core";
import type { EnrichedProject } from "@/lib/types";
import Link from "next/link";
import ProjectCard from "./ProjectCard";

/**
 * The ranked projects after the lead block, grouped by capability. Groups
 * appear in order of their best-ranked project; cards keep rank order.
 * `registrySlugs` (catalog order) supplies each project's stable CI number.
 */
export default function CapabilityGroups({
  ranked,
  registrySlugs,
  limit,
}: {
  ranked: readonly EnrichedProject[];
  registrySlugs: readonly string[];
  /** Show only each group's first `limit` projects, with a link to the full group. */
  limit?: number;
}) {
  const groups = capabilityGroups(ranked);
  // The group's full size, lead projects included, matches the /projects filter count.
  const total = (capability: string) => ranked.filter((p) => p.capability === capability).length;
  const registryIndex = new Map(registrySlugs.map((slug, i) => [slug, i] as const));
  return (
    <div className="category-groups">
      {groups.map((g) => {
        const meta = isCapabilityId(g.capability) ? capabilityMeta[g.capability] : undefined;
        const id = `group-${g.capability}`;
        return (
          <section key={g.capability} className="category-group" aria-labelledby={id}>
            <header className="category-group__head">
              <h3 id={id} className="category-group__title">
                {meta?.label ?? g.capability}
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
                href={`/projects?group=${g.capability}`}
                className="category-group__more detail-nav-link"
                prefetch={false}
                data-umami-event="home-see-all"
                data-umami-event-group={g.capability}
              >
                See all {total(g.capability)} in {meta?.label ?? g.capability} →
              </Link>
            )}
          </section>
        );
      })}
    </div>
  );
}
