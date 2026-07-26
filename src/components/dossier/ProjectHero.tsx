import Link from "next/link";
import type { CSSProperties } from "react";
import type { EnrichedProject } from "@/lib/types";
import { LockIcon, ExternalIcon, ChevronIcon, getCategoryIcon } from "@/components/Icons";
import { isProjectLive } from "@/lib/deployments";

type CategoryMeta = { label: string; icon: string };

interface ProjectHeroProps {
  project: EnrichedProject;
  accentColor: string;
  meta: CategoryMeta | undefined;
}

/**
 * Standard top band for every `/projects/[slug]` — icon, title, badges, tagline, tech, CTAs.
 */
export function ProjectHero({ project, accentColor, meta }: ProjectHeroProps) {
  const hasDemo = isProjectLive(project);

  return (
    <>
      <div className="cosmic-page detail-breadcrumb">
        <nav className="detail-breadcrumb__nav" aria-label="Breadcrumb">
          <Link href="/projects">← Catalog</Link>
          <ChevronIcon className="w-3 h-3 opacity-50 shrink-0" aria-hidden />
          <span className="detail-breadcrumb__current truncate">
            {project.displayName}
          </span>
        </nav>
      </div>

      <header
        className="dossier-page__hero-band"
        style={
          {
            "--dossier-accent": accentColor,
          } as CSSProperties
        }
      >
        <div className="cosmic-page">
          <div className="flex items-start gap-4 sm:gap-5">
            <div
              className="dossier-page__hero-icon flex-shrink-0 rounded-xl flex items-center justify-center"
              style={{
                color: accentColor,
              }}
            >
              {getCategoryIcon(meta?.icon || "globe", "w-6 h-6")}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-1.5">
                <h1 className="dossier-page__title">{project.displayName}</h1>

                <span
                  className="detail-cat-badge"
                  style={{ "--badge-color": accentColor } as React.CSSProperties}
                >
                  <span className="detail-cat-badge__dot" />
                  {meta?.label || project.category}
                </span>

                {project.private && (
                  <span className="dossier-page__pill dossier-page__pill--muted">
                    <LockIcon className="w-3 h-3" />
                    Private
                  </span>
                )}

                {hasDemo && (
                  <span className="dossier-page__pill dossier-page__pill--live">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: "var(--color-live)" }}
                    />
                    live
                  </span>
                )}
              </div>

              <p className="dossier-page__tagline">{project.tagline}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.techStack.map((tech) => (
                  <span key={tech} className="detail-tech-chip">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {hasDemo && (
                  <a
                    href={project.liveUrl || project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-cta"
                  >
                    <span className="detail-cta__pulse" />
                    Launch Demo
                    <ExternalIcon className="w-3 h-3 opacity-80" />
                  </a>
                )}
                {project.private && (
                  <span className="dossier-page__pill dossier-page__pill--border">
                    <LockIcon className="w-3.5 h-3.5" />
                    Private Repository
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
