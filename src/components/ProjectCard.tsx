import Link from "next/link";
import { EnrichedProject } from "@/lib/types";
import { formatDate, languageColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import { LockIcon, getCategoryIcon } from "./Icons";
import DemoLink from "./DemoLink";

interface ProjectCardProps {
  project: EnrichedProject;
  featured?: boolean;
}

const catColors: Record<string, string> = {
  finance: "#2DD4BF",
  ai: "#A78BFA",
  osint: "#FBBF24",
  data: "#38BDF8",
  infra: "#F472B6",
  apps: "#34D399",
};

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
  const accentColor = catColors[project.category] || "#2DD4BF";

  return (
    <div
      className="cosmic-project-card group relative"
      style={{ "--card-accent": accentColor } as React.CSSProperties}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="block p-5 flex flex-col h-full"
        style={{ textDecoration: "none" }}
      >
        {/* Top row: icon + category + date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="cosmic-card-icon">
              {getCategoryIcon(meta?.icon || "globe", "w-3.5 h-3.5")}
            </div>
            <span className="cosmic-card-category">
              {meta?.label || project.category}
            </span>
            {project.private && (
              <LockIcon className="w-3 h-3 opacity-40" />
            )}
          </div>
          {project.lastUpdated && (
            <span className="cosmic-card-date">
              {formatDate(project.lastUpdated)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="cosmic-card-title group-hover:text-[var(--color-accent)] transition-colors duration-150">
          {project.displayName}
        </h3>

        {/* Description — two lines */}
        <p className="cosmic-card-desc line-clamp-2">
          {project.tagline}
        </p>

        {/* Footer row */}
        <div className="flex items-center gap-3">
          {project.language && (
            <span className="cosmic-card-lang">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: langColor || "#6B7280" }}
              />
              {project.language}
            </span>
          )}
          {project.stars > 0 && (
            <span
              className="flex items-center gap-1"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
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
            <span className="cosmic-card-live">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                style={{ background: "var(--color-live)" }}
              />
              live
            </span>
          )}
          <span className="cosmic-card-arrow opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        </div>
      </Link>

      {/* Demo link — separate client component */}
      {hasDemo && demoUrl && <DemoLink url={demoUrl} />}
    </div>
  );
}
