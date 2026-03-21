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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
        {/* Category pills — horizontally scrollable on mobile */}
        <div className="filter-pills-row flex gap-1.5">
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
                onClick={() => setActiveCategory(cat.key)}
                className="px-2.5 py-1 rounded-md transition-all duration-150 whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: active ? pillColor : "var(--color-text-faint)",
                  background: active ? `${pillColor}12` : "transparent",
                  border: active
                    ? `1px solid ${pillColor}30`
                    : "1px solid transparent",
                  boxShadow: active ? `0 0 8px ${pillColor}20` : "none",
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

        {/* Segmented sort control */}
        <div
          style={{
            display: "flex",
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {(["recent", "name", "stars"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                padding: "6px 12px",
                color:
                  sortBy === opt
                    ? "var(--color-accent)"
                    : "var(--color-text-faint)",
                background:
                  sortBy === opt ? "var(--color-surface-3)" : "transparent",
                border: "none",
                borderRight:
                  opt !== "stars" ? "1px solid var(--color-border)" : "none",
                cursor: "pointer",
                transition: "all 150ms",
                minHeight: "36px",
              }}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
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

      {/* Grid — 3-col desktop, 2-col tablet, 1-col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
