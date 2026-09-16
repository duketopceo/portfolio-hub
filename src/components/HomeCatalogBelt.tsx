import Link from "next/link";
import type { CSSProperties } from "react";
import { categoryMeta } from "@/data/projects";
import { isProjectLive } from "@/lib/deployments";
import type { EnrichedProject, ProjectCategory } from "@/lib/types";
import { catColors } from "@/lib/utils";

const sectorOrder: ProjectCategory[] = [
  "ai",
  "infra",
  "apps",
  "data",
  "finance",
  "osint",
];

interface HomeCatalogBeltProps {
  projects: EnrichedProject[];
  registryIndexOf: number[];
}

export function HomeCatalogBelt({
  projects,
  registryIndexOf,
}: HomeCatalogBeltProps) {
  const registryIndex = new Map(
    projects.map((project, index) => [project.slug, registryIndexOf[index] ?? index])
  );
  const sectors = sectorOrder
    .map((category) => ({
      category,
      projects: projects.filter((project) => project.category === category),
    }))
    .filter((sector) => sector.projects.length > 0);

  return (
    <section className="home-catalog" aria-labelledby="home-catalog-heading">
      <div className="home-section__head home-catalog__head">
        <p className="reg-label reg-label--accent">Fig. 02 — Catalog belt</p>
        <h2 id="home-catalog-heading">Catalog belt</h2>
        <p>
          The remaining systems are grouped by operating sector, indexed, and
          one click from their dossier.
        </p>
        <Link href="/projects#domain-map" className="detail-nav-link">
          Open full registry →
        </Link>
      </div>

      <div className="home-catalog__sectors">
        {sectors.map(({ category, projects: sectorProjects }) => (
          <section
            key={category}
            className="home-catalog__sector"
            style={{ "--sector-accent": catColors[category] } as CSSProperties}
            aria-labelledby={`home-sector-${category}`}
          >
            <header className="home-catalog__sector-head">
              <div>
                <h3 id={`home-sector-${category}`}>{categoryMeta[category].label}</h3>
                <p className="home-catalog__sector-desc">
                  {categoryMeta[category].description}
                </p>
              </div>
              <span className="home-catalog__count">
                {String(sectorProjects.length).padStart(2, "0")}
              </span>
            </header>

            <div className="home-catalog__list">
              {sectorProjects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="home-catalog__item"
                >
                  <span className="home-catalog__index">
                    CI-{String(registryIndex.get(project.slug) ?? 0).padStart(2, "0")}
                  </span>
                  <span className="home-catalog__name">{project.displayName}</span>
                  <span className="home-catalog__type">{project.type}</span>
                  <span
                    className={
                      isProjectLive(project)
                        ? "home-catalog__status home-catalog__status--live"
                        : "home-catalog__status"
                    }
                  >
                    {isProjectLive(project) ? "live" : project.private ? "restricted" : "public"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
