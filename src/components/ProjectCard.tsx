"use client";

import { useState } from "react";
import Link from "next/link";
import { EnrichedProject } from "@/lib/types";
import { formatDate, languageColors, catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import { LockIcon, getCategoryIcon } from "./Icons";
import DemoLink from "./DemoLink";
import RepoDetailModal from "./RepoDetailModal";

interface ProjectCardProps {
  project: EnrichedProject;
  featured?: boolean;
}

export default function ProjectCard({
  project,
}: ProjectCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const meta = categoryMeta[project.category];
  const hasDemo = !!(project.liveUrl || project.demoUrl);
  const demoUrl = project.liveUrl || project.demoUrl;
  const langColor = project.language
    ? languageColors[project.language] || "#6B7280"
    : null;
  const accentColor = catColors[project.category] || "#2DD4BF";

  return (
    <article
      className="cosmic-project-card group relative"
      style={{ "--card-accent": accentColor } as React.CSSProperties}
    >
      <button
        type="button"
        className="cosmic-project-card__main flex flex-col flex-1 text-left w-full"
        onClick={() => setModalOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={modalOpen}
      >
        <header className="cosmic-project-card__top">
          <div className="cosmic-project-card__identity">
            <div className="cosmic-card-icon" aria-hidden>
              {getCategoryIcon(meta?.icon || "globe", "w-4 h-4")}
            </div>
            <div className="cosmic-project-card__labels">
              <span className="cosmic-card-category">
                {meta?.label || project.category}
              </span>
              {project.private && (
                <LockIcon
                  className="cosmic-project-card__lock w-3.5 h-3.5 opacity-50"
                  aria-label="Private repository"
                />
              )}
            </div>
          </div>
          {project.lastUpdated && (
            <time className="cosmic-card-date" dateTime={project.lastUpdated}>
              {formatDate(project.lastUpdated)}
            </time>
          )}
        </header>

        <h3
          className="cosmic-card-title group-hover:text-[var(--color-accent)] transition-colors duration-200 truncate max-w-full"
          title={project.displayName}
        >
          {project.displayName}
        </h3>

        <p
          className="cosmic-card-desc line-clamp-3 break-words"
          title={project.tagline}
        >
          {project.tagline}
        </p>

        <div className="cosmic-project-card__meta" aria-label="Project metadata">
          <div className="cosmic-project-card__pills">
            {project.language && (
              <span className="cosmic-card-pill">
                <span
                  className="cosmic-card-pill__dot"
                  style={{ backgroundColor: langColor || "#6B7280" }}
                />
                {project.language}
              </span>
            )}
            {project.stars > 0 && (
              <span className="cosmic-card-pill cosmic-card-pill--muted">
                <svg
                  className="w-3.5 h-3.5 opacity-70"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path d="M10 1l2.47 5.01L18 6.86l-4 3.9.94 5.5L10 13.47l-4.94 2.79.94-5.5-4-3.9 5.53-.85L10 1z" />
                </svg>
                {project.stars}
              </span>
            )}
            {hasDemo && (
              <span className="cosmic-card-pill cosmic-card-pill--live">
                <span className="cosmic-card-pill__pulse" />
                Live
              </span>
            )}
          </div>
          <span className="cosmic-project-card__chevron" aria-hidden>
            Details
            <span className="cosmic-project-card__chevron-arrow">→</span>
          </span>
        </div>
      </button>

      <Link
        href={`/projects/${project.slug}`}
        className="cosmic-project-card__dossier-link"
        onClick={(e) => e.stopPropagation()}
        prefetch={false}
      >
        Dossier only →
      </Link>

      {hasDemo && demoUrl && <DemoLink url={demoUrl} />}

      <RepoDetailModal
        project={project}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </article>
  );
}
