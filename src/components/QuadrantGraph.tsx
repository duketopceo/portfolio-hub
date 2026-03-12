"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { EnrichedProject } from "@/lib/types";
import {
  quadrantPositions,
  quadrantLabels,
  axisLabels,
} from "@/data/quadrant-positions";
import { categoryMeta } from "@/data/projects";
import { projectIconMap } from "./ProjectIcons";

interface QuadrantGraphProps {
  projects: EnrichedProject[];
}

/** Category → accent color */
const catColors: Record<string, string> = {
  finance: "#2dd4bf", // teal
  ai: "#a78bfa", // purple
  osint: "#f59e0b", // amber
  data: "#38bdf8", // sky
  infra: "#f472b6", // pink
  apps: "#34d399", // emerald
};

export default function QuadrantGraph({ projects }: QuadrantGraphProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  const positioned = useMemo(() => {
    return projects.map((p) => {
      const pos = quadrantPositions[p.slug] || { x: 0, y: 0 };
      return { ...p, qx: pos.x, qy: pos.y };
    });
  }, [projects]);

  const filtered = activeCategory
    ? positioned.filter((p) => p.category === activeCategory)
    : positioned;

  const filteredSlugs = useMemo(
    () => new Set(filtered.map((p) => p.slug)),
    [filtered]
  );

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category));
    return Array.from(cats).sort();
  }, [projects]);

  // Trigger staggered entrance after mount
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="q-root">
      {/* ── Filter row ─────────────────────────────── */}
      <div className="q-filters">
        <button
          onClick={() => setActiveCategory(null)}
          className={`q-pill ${!activeCategory ? "q-pill--active" : ""}`}
        >
          All
          <span className="q-pill__count">{projects.length}</span>
        </button>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const count = projects.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className={`q-pill ${isActive ? "q-pill--active" : ""}`}
              style={{ "--pill-color": catColors[cat] } as React.CSSProperties}
            >
              <span className="q-pill__dot" />
              {categoryMeta[cat]?.label || cat}
              <span className="q-pill__count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Graph ──────────────────────────────────── */}
      <div className="q-graph-outer">
      <div className="q-graph" ref={graphRef}>
        {/* Grid lines — subtle subdivisions */}
        <div className="q-gridlines" aria-hidden="true">
          <div className="q-gridline q-gridline--h" style={{ top: "25%" }} />
          <div className="q-gridline q-gridline--h" style={{ top: "75%" }} />
          <div className="q-gridline q-gridline--v" style={{ left: "25%" }} />
          <div className="q-gridline q-gridline--v" style={{ left: "75%" }} />
        </div>

        {/* Main axes */}
        <div className="q-axis q-axis--x" />
        <div className="q-axis q-axis--y" />

        {/* Axis labels */}
        <span className="q-axlabel q-axlabel--l">{axisLabels.left}</span>
        <span className="q-axlabel q-axlabel--r">{axisLabels.right}</span>
        <span className="q-axlabel q-axlabel--t">{axisLabels.top}</span>
        <span className="q-axlabel q-axlabel--b">{axisLabels.bottom}</span>

        {/* Quadrant zone labels */}
        <span className="q-zone q-zone--tl">{quadrantLabels.topLeft}</span>
        <span className="q-zone q-zone--tr">{quadrantLabels.topRight}</span>
        <span className="q-zone q-zone--bl">{quadrantLabels.bottomLeft}</span>
        <span className="q-zone q-zone--br">{quadrantLabels.bottomRight}</span>

        {/* ── Project nodes ─────────────────────── */}
        {positioned.map((project, index) => {
          // Convert -1..1 to percentage with padding (10% margin)
          const pad = 10;
          const range = 100 - 2 * pad;
          const leftPct = pad + ((project.qx + 1) / 2) * range;
          const topPct = pad + ((1 - project.qy) / 2) * range;
          const isHovered = hoveredSlug === project.slug;
          const dotColor = catColors[project.category] || "#2dd4bf";
          const IconComponent = projectIconMap[project.slug];
          const hasDemo = !!(project.liveUrl || project.demoUrl);
          const isVisible = filteredSlugs.has(project.slug);

          return (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className={`q-node q-node-fade ${
                !isVisible ? "q-node-fade-out" : ""
              } ${isHovered ? "q-node--hover" : ""} ${
                project.featured ? "q-node--feat" : ""
              } ${hasEntered ? "q-node-enter" : ""}`}
              style={
                {
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  "--node-color": dotColor,
                  animationDelay: hasEntered ? `${index * 40}ms` : "0ms",
                  pointerEvents: isVisible ? "auto" : "none",
                } as React.CSSProperties
              }
              onMouseEnter={() => setHoveredSlug(project.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
            >
              {/* Icon circle */}
              <span className="q-node__icon">
                {IconComponent ? (
                  <IconComponent size={20} />
                ) : (
                  <span className="q-node__fallback" />
                )}
              </span>

              {/* Label below */}
              <span className="q-node__label">{project.displayName}</span>

              {/* Live badge */}
              {hasDemo && (
                <span className="q-node__live" />
              )}

              {/* ── Hover card ─────────────────── */}
              {isHovered && (
                <div className="q-card" onClick={(e) => e.stopPropagation()}>
                  <div className="q-card__head">
                    <span className="q-card__icon">
                      {IconComponent && <IconComponent size={18} />}
                    </span>
                    <div>
                      <div className="q-card__title">
                        {project.displayName}
                      </div>
                      <div className="q-card__cat">
                        {categoryMeta[project.category]?.label}
                      </div>
                    </div>
                  </div>
                  <p className="q-card__desc">{project.tagline}</p>
                  <div className="q-card__chips">
                    {project.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="q-card__chip">
                        {t}
                      </span>
                    ))}
                  </div>
                  {hasDemo && (
                    <div className="q-card__demo">
                      <span className="q-card__pulse" />
                      Live Demo
                    </div>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
      </div>

      {/* ── Footer legend ──────────────────────────── */}
      <div className="q-legend">
        <span className="q-legend__count">
          {filtered.length} project{filtered.length !== 1 && "s"}
          {activeCategory &&
            ` in ${categoryMeta[activeCategory]?.label || activeCategory}`}
        </span>
        <span className="q-legend__hint">Click a node to explore</span>
      </div>
    </div>
  );
}
