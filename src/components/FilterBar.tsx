"use client";

import { useState } from "react";
import { EnrichedProject, ProjectCategory } from "@/lib/types";
import { catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import PullRequestsPanel from "./PullRequestsPanel";

interface FilterBarProps {
  projects: EnrichedProject[];
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

const sortLabels: Record<"recent" | "name" | "stars", string> = {
  recent: "Recent",
  name: "Name",
  stars: "Stars",
};

export default function FilterBar({ projects }: FilterBarProps) {
  const [mainView, setMainView] = useState<"catalog" | "prs">("catalog");
  const [activeCategory, setActiveCategory] = useState<
    ProjectCategory | "all"
  >("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "stars">("recent");

  const filtered = projects
    .filter(
      (p) => activeCategory === "all" || p.category === activeCategory
    )
    .sort((a, b) => {
      if (sortBy === "recent")
        return (
          new Date(b.lastUpdated).getTime() -
          new Date(a.lastUpdated).getTime()
        );
      if (sortBy === "stars") return b.stars - a.stars;
      return a.displayName.localeCompare(b.displayName);
    });

  const scopeLabel =
    activeCategory !== "all"
      ? categoryMeta[activeCategory]?.label || activeCategory
      : null;

  return (
    <div className="catalog-panel">
      <div className="catalog-toolbar catalog-toolbar--stacked">
        <div
          className="catalog-view-toggle"
          role="tablist"
          aria-label="Projects or pull requests"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mainView === "catalog"}
            className={`catalog-view-toggle__btn${mainView === "catalog" ? " catalog-view-toggle__btn--active" : ""}`}
            onClick={() => setMainView("catalog")}
          >
            Registry
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainView === "prs"}
            className={`catalog-view-toggle__btn${mainView === "prs" ? " catalog-view-toggle__btn--active" : ""}`}
            onClick={() => setMainView("prs")}
          >
            Open PRs
          </button>
        </div>

        {mainView === "catalog" && (
          <div className="catalog-toolbar__row">
            <div
              className="catalog-pills filter-pills-row"
              role="tablist"
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
                    role="tab"
                    aria-selected={active}
                    id={`catalog-tab-${cat.key}`}
                    onClick={() => setActiveCategory(cat.key)}
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

            <div
              className="catalog-sort"
              role="group"
              aria-label="Sort projects"
            >
              {(["recent", "name", "stars"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSortBy(opt)}
                  className={`catalog-sort__btn${sortBy === opt ? " catalog-sort__btn--active" : ""}`}
                >
                  {sortLabels[opt]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {mainView === "catalog" ? (
        <>
          <p className="catalog-results-meta">
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
          </p>

          <div className="catalog-grid">
            {filtered.map((project, i) => (
              <div
                key={project.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <ProjectCard
                  project={project}
                  registryIndex={projects.findIndex(
                    (p) => p.slug === project.slug
                  )}
                />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="catalog-empty">
              No projects in this category.
            </div>
          )}
        </>
      ) : (
        <div className="catalog-pr-panel">
          <p className="catalog-results-meta catalog-results-meta--prs">
            Open pull requests across all catalog repositories (GitHub token
            required for private repos).
          </p>
          <PullRequestsPanel />
        </div>
      )}
    </div>
  );
}
