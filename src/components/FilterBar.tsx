"use client";

import { useEffect, useState } from "react";
import { EnrichedProject } from "@/lib/types";
import {
  CAPABILITY_IDS,
  capabilityMeta,
  isCapabilityId,
  type CapabilityId,
} from "@/data/capability-meta";
import ProjectCard from "./ProjectCard";
import LeadProjectCard from "./LeadProjectCard";
import CapabilityGroups from "./CapabilityGroups";
import { leadProjects } from "@/lib/ranking-core";

interface FilterBarProps {
  /** Ranked order (src/lib/ranking.ts). */
  projects: EnrichedProject[];
  /** Catalog order, for each card's stable CI number. */
  registrySlugs: string[];
}

const groups: { key: CapabilityId | "all"; label: string; color: string }[] = [
  { key: "all", label: "All", color: "#2DD4BF" },
  ...CAPABILITY_IDS.map((id) => ({
    key: id,
    label: capabilityMeta[id].label,
    color: capabilityMeta[id].color,
  })),
];

export default function FilterBar({ projects, registrySlugs }: FilterBarProps) {
  const [activeGroup, setActiveGroup] = useState<CapabilityId | "all">("all");

  // /projects?group=<id> (the home "See all" links) opens on that group;
  // anything else, including the retired ?category=, is ignored.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("group");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the query string only exists in the browser; reading it during render would mismatch the static HTML.
    if (isCapabilityId(wanted)) setActiveGroup(wanted);
  }, []);

  // `projects` arrives in ranking order; filtering keeps that order.
  const filtered = projects.filter(
    (p) => activeGroup === "all" || p.capability === activeGroup
  );
  const showBands = activeGroup === "all";
  const registryIndex = new Map(registrySlugs.map((slug, i) => [slug, i] as const));

  const scopeLabel =
    activeGroup !== "all"
      ? capabilityMeta[activeGroup].label
      : null;

  return (
    <div className="catalog-panel">
      <div className="catalog-toolbar catalog-toolbar--stacked">
        <div className="catalog-toolbar__row">
          <div
            className="catalog-pills filter-pills-row"
            role="group"
            aria-label="Filter by capability"
          >
            {groups.map((cat) => {
              const count =
                cat.key === "all"
                  ? projects.length
                  : projects.filter((p) => p.capability === cat.key).length;
              if (count === 0 && cat.key !== "all") return null;
              const active = activeGroup === cat.key;
                            return (
                <button
                  key={cat.key}
                  type="button"
                  aria-pressed={active}
                  id={`catalog-filter-${cat.key}`}
                  onClick={() => setActiveGroup(cat.key)}
                  data-umami-event="catalog-filter"
                  data-umami-event-group={cat.key}
                  className={`catalog-pill${active ? " catalog-pill--active" : ""}`}
                  style={
                    { "--pill-accent": cat.color } as React.CSSProperties
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
            onClick={() => setActiveGroup("all")}
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
          <CapabilityGroups ranked={filtered} registrySlugs={registrySlugs} />
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
