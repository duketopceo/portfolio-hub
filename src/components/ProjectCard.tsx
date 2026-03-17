import Link from "next/link";
import { EnrichedProject } from "@/lib/types";
import { formatDate, languageColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import { LockIcon } from "./Icons";
import DemoLink from "./DemoLink";

interface ProjectCardProps {
  project: EnrichedProject;
  featured?: boolean;
}

export default function ProjectCard({
  project,
  featured = false,
}: ProjectCardProps) {
  const meta = categoryMeta[project.category];
  const hasDemo = !!(project.liveUrl || project.demoUrl);
  const demoUrl = project.liveUrl || project.demoUrl;
  const langColor = project.language
    ? languageColors[project.language] || "#6B7280"
    : null;

  return (
    <div
      className="glass-card lang-border-top group relative"
      style={
        langColor
          ? ({ "--lang-color": langColor } as React.CSSProperties)
          : undefined
      }
    >
      <Link
        href={`/projects/${project.slug}`}
        className="block p-5"
        style={{ textDecoration: "none" }}
      >
        {/* Top row: category + date */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
                letterSpacing: "0.02em",
              }}
            >
              {meta?.label || project.category}
            </span>
            {project.private && (
              <LockIcon className="w-3 h-3" />
            )}
          </div>
          {project.lastUpdated && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
              }}
            >
              {formatDate(project.lastUpdated)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="mb-1"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            color: "var(--color-text)",
            lineHeight: 1.3,
          }}
        >
          <span className="group-hover:text-[var(--color-accent)] transition-colors duration-150">
            {project.displayName}
          </span>
        </h3>

        {/* Description — one line */}
        <p
          className="mb-3 line-clamp-2"
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
          }}
        >
          {project.tagline}
        </p>

        {/* Bottom row: language + stars */}
        <div className="flex items-center gap-4">
          {project.language && (
            <span
              className="flex items-center gap-1.5"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: langColor || "#6B7280",
                }}
              />
              {project.language}
            </span>
          )}
          {project.stars > 0 && (
            <span
              className="flex items-center gap-1"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
              }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 1l2.47 5.01L18 6.86l-4 3.9.94 5.5L10 13.47l-4.94 2.79.94-5.5-4-3.9 5.53-.85L10 1z" />
              </svg>
              {project.stars}
            </span>
          )}
          {hasDemo && (
            <span
              className="flex items-center gap-1 ml-auto"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-live)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "var(--color-live)" }}
              />
              live
            </span>
          )}
        </div>
      </Link>

      {/* Demo link — separate client component */}
      {hasDemo && demoUrl && <DemoLink url={demoUrl} />}
    </div>
  );
}
