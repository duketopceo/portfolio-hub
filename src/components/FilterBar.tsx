"use client";

import { useState } from "react";
import { EnrichedProject, ProjectCategory } from "@/lib/types";
import { catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/category-meta";
import ProjectCard from "./ProjectCard";
import LeadProjectCard from "./LeadProjectCard";
import CategoryGroups from "./CategoryGroups";
import { leadProjects } from "@/lib/ranking-core";

interface FilterBarProps {
  /** Ranked order (src/lib/ranking.ts). */
  projects: EnrichedProject[];
  /** Catalog order, for each card's stable CI number. */
  registrySlugs: string[];
}

const categories: { key: ProjectCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "finance", label: "Finance" },
  { key: "ai", label: "AI" },
  { key: "osint", label: "OSINT" },
  { key: "data", label: "Data" },
  { key: "infra", label: "Infra" },
  { key: "apps", label: "Apps" },
];

export default function FilterBar({ projects, registrySlugs }: FilterBarProps) {
  const [activeCategory, setActiveCategory] = useState<
    ProjectCategory | "all"
  >("all");

  // `projects` arrives in ranking order; filtering keeps that order.
  const filtered = projects.filter(
    (p) => activeCategory === "all" || p.category === activeCategory
  );
  const showBands = activeCategory === "all";
  const registryIndex = new Map(registrySlugs.map((slug, i) => [slug, i] as const));

  const scopeLabel =
    activeCategory !== "all"
      ? categoryMeta[activeCategory]?.label || activeCategory
      : null;

  return (
    <div className="catalog-panel">
      <div className="catalog-toolbar catalog-toolbar--stacked">
        <div className="catalog-toolbar__row">
          <div
            className="catalog-pills filter-pills-row"
            role="group"
            aria-label="Filter by category"
          >
            {categories.map((cat) => {
              const count =
                cat.key === "all"
                  ? projects.length
                  : projects.filter((p) => p.category === cat.key).length;
              if (count === 0 && cat.key !== "all") return null;
              const active = activeCategory === cat.key;
              const pillColor = catColors[cat.key] || "#2DD4BF";
              return (
                <button
                  key={cat.key}
                  type="button"
                  aria-pressed={active}
                  id={`catalog-filter-${cat.key}`}
                  onClick={() => setActiveCategory(cat.key)}
                  data-umami-event="catalog-filter"
                  data-umami-event-category={cat.key}
                  className={`catalog-pill${active ? " catalog-pill--active" : ""}`}
                  style={
                    { "--pill-accent": pillColor } as React.CSSProperties
                  }
                >
                  <span className="catalog-pill__label">{cat.label}</span>
                  <span className="catalog-pill__count" aria-label={`${count} projects`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      <p className="catalog-results-meta" aria-live="polite">
        <span className="catalog-results-meta__n">{filtered.length}</span>
        <span>
          {" "}
          project{filtered.length !== 1 ? "s" : ""} shown
        </span>
        {scopeLabel && (
          <span className="catalog-results-meta__scope">
            {" "}
            · {scopeLabel}
          </span>
        )}
        {!scopeLabel && <span> · ranked, strongest first</span>}
      </p>

      {filtered.length === 0 ? (
        <div className="catalog-empty">
          <p>No projects match this filter.</p>
          <button
            type="button"
            className="detail-cta detail-cta--secondary"
            onClick={() => setActiveCategory("all")}
          >
            Clear filter
          </button>
        </div>
      ) : showBands ? (
        <>
          <section className="projects-leads" aria-labelledby="projects-leads-heading">
            <h2 id="projects-leads-heading" className="category-group__title">
              Lead work
            </h2>
            <div className="lead-grid">
              {leadProjects(filtered).map((p, i) => (
                <LeadProjectCard key={p.slug} project={p} rank={i + 1} />
              ))}
            </div>
          </section>
          <CategoryGroups ranked={filtered} registrySlugs={registrySlugs} />
        </>
      ) : (
        <div className="catalog-grid">
          {filtered.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              registryIndex={registryIndex.get(project.slug) ?? -1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
