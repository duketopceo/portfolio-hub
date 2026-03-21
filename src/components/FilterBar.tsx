"use client";

import { useState } from "react";
import { EnrichedProject, ProjectCategory } from "@/lib/types";
import { categoryMeta } from "@/data/projects";
import ProjectCard from "./ProjectCard";

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

const catPillColors: Record<string, string> = {
  all: "#2DD4BF",
  finance: "#2DD4BF",
  ai: "#A78BFA",
  osint: "#FBBF24",
  data: "#38BDF8",
  infra: "#F472B6",
  apps: "#34D399",
};

const sortLabels: Record<"recent" | "name" | "stars", string> = {
  recent: "Recent",
  name: "Name",
  stars: "Stars",
};

export default function FilterBar({ projects }: FilterBarProps) {
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
      <div className="catalog-toolbar">
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
            const pillColor = catPillColors[cat.key] || "#2DD4BF";
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
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="catalog-empty">
          No projects in this category.
        </div>
      )}
    </div>
  );
}
