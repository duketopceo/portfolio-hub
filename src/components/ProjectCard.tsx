import Link from "next/link";
import { EnrichedProject } from "@/lib/types";
import { formatMonthYear, languageColors, catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/category-meta";
import { isProjectLive } from "@/lib/deployments";
import { getCategoryIcon } from "./Icons";
import DemoLink from "./DemoLink";
import GithubLink from "./GithubLink";

interface ProjectCardProps {
  project: EnrichedProject;
  /** Stable registry index — position in projects.ts source order. */
  registryIndex?: number;
}

export default function ProjectCard({
  project,
  registryIndex,
}: ProjectCardProps) {
  const meta = categoryMeta[project.category];
  const hasDemo = isProjectLive(project);
  const demoUrl = project.liveUrl || project.demoUrl;
  const langColor = project.language
    ? languageColors[project.language] || "#6B7280"
    : null;
  const topics = project.private ? [] : (project.topics ?? []).slice(0, 3);
  const forks = project.private ? 0 : (project.forks ?? 0);
  const issues = project.private ? 0 : (project.openIssuesCount ?? 0);
  const updated = formatMonthYear(project.lastUpdated);
  const accentColor = catColors[project.category] || "#2DD4BF";

  return (
    <article
      className="cosmic-project-card group relative"
      style={{ "--card-accent": accentColor } as React.CSSProperties}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="cosmic-project-card__main flex flex-col flex-1 text-left w-full"
        prefetch={false}
        data-umami-event="survey-file-open"
        data-umami-event-slug={project.slug}
        data-umami-event-source="project-card"
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
                <span className="cosmic-card-pill cosmic-card-pill--private">
                  Private
                </span>
              )}
            </div>
          </div>
          <span className="cosmic-project-card__meta-right">
            {typeof registryIndex === "number" && registryIndex >= 0 && (
              <span className="reg-num cosmic-card-reg" aria-hidden="true">
                CI-{String(registryIndex + 1).padStart(2, "0")}
              </span>
            )}
          </span>
        </header>

        <h3
          className="cosmic-card-title group-hover:text-[var(--color-accent)] transition-colors duration-200 truncate max-w-full"
          title={project.displayName}
        >
          {project.displayName}
        </h3>

        <p
          className="cosmic-card-desc line-clamp-2 break-words"
          title={project.tagline}
        >
          {project.tagline}
        </p>

        {topics.length > 0 && (
          <ul className="cosmic-card-topics" aria-label="Topics">
            {topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        )}

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
            {forks > 0 && (
              <span
                className="cosmic-card-pill cosmic-card-pill--muted"
                title={`${forks} forks`}
              >
                <svg
                  className="w-3.5 h-3.5 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 16 16"
                  aria-hidden
                >
                  <circle cx="4" cy="3" r="1.6" />
                  <circle cx="12" cy="3" r="1.6" />
                  <circle cx="8" cy="13" r="1.6" />
                  <path d="M4 4.6v1.4c0 1 .8 1.8 1.8 1.8h4.4c1 0 1.8-.8 1.8-1.8V4.6M8 7.8v3.6" />
                </svg>
                <span className="sr-only">Forks </span>
                {forks}
              </span>
            )}
            {issues > 0 && (
              <span className="cosmic-card-pill cosmic-card-pill--muted">
                {issues} open {issues === 1 ? "issue" : "issues"}
              </span>
            )}
            {hasDemo && (
              <span className="cosmic-card-pill cosmic-card-pill--live">
                <span className="cosmic-card-pill__pulse" />
                Live
              </span>
            )}
          </div>
          {updated && (
            <time
              className="cosmic-card-date cosmic-card-updated"
              dateTime={project.lastUpdated}
            >
              Updated {updated}
            </time>
          )}
          <span className="cosmic-project-card__chevron" aria-hidden>
            Open dossier
            <span className="cosmic-project-card__chevron-arrow">→</span>
          </span>
        </div>
      </Link>

      {project.githubUrl && !project.private && (
        <GithubLink url={project.githubUrl} />
      )}
      {hasDemo && demoUrl && <DemoLink url={demoUrl} />}
    </article>
  );
}
