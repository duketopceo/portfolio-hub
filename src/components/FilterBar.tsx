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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const count =
              cat.key === "all"
                ? projects.length
                : projects.filter((p) => p.category === cat.key).length;
            if (count === 0 && cat.key !== "all") return null;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  activeCategory === cat.key
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {cat.label}
                <span className="ml-1.5 text-xs opacity-60">{count}</span>
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
          className="text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="recent">Recently updated</option>
          <option value="name">Name</option>
          <option value="stars">Stars</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-zinc-500 mb-4">
        {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "all" &&
          ` in ${categoryMeta[activeCategory]?.label || activeCategory}`}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
          <p className="text-lg">No projects in this category yet.</p>
        </div>
      )}
    </div>
  );
}
