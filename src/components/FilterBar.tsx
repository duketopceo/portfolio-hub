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

  return (
    <div>
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        {/* Category chips — glass strip */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const count =
              cat.key === "all"
                ? projects.length
                : projects.filter((p) => p.category === cat.key).length;
            if (count === 0 && cat.key !== "all") return null;
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="px-2.5 py-1 rounded-md transition-all duration-150"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: active
                    ? "var(--color-accent)"
                    : "var(--color-text-faint)",
                  background: active ? "var(--glass-bg)" : "transparent",
                  border: active
                    ? "1px solid var(--glass-border)"
                    : "1px solid transparent",
                }}
              >
                {cat.label}
                <span className="ml-1" style={{ opacity: 0.6 }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "recent" | "name" | "stars")
          }
          className="rounded-md px-2.5 py-1"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--color-text-faint)",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(var(--glass-blur))",
            outline: "none",
          }}
        >
          <option value="recent">Recent</option>
          <option value="name">Name</option>
          <option value="stars">Stars</option>
        </select>
      </div>

      {/* Count */}
      <p
        className="mb-4"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-faint)",
        }}
      >
        {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "all" &&
          ` in ${categoryMeta[activeCategory]?.label || activeCategory}`}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div
          className="text-center py-16 rounded-lg"
          style={{
            color: "var(--color-text-faint)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
          }}
        >
          No projects in this category.
        </div>
      )}
    </div>
  );
}
