import Link from "next/link";
import { EnrichedProject } from "@/lib/types";
import { formatDate, languageColors, categoryColors, categoryColorsLight } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";

interface ProjectCardProps {
  project: EnrichedProject;
  featured?: boolean;
}

export default function ProjectCard({
  project,
  featured = false,
}: ProjectCardProps) {
  const meta = categoryMeta[project.category];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-all hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md dark:hover:shadow-teal-500/5 ${
        featured ? "sm:p-6" : ""
      }`}
    >
      {/* Category + Type */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${categoryColorsLight[project.category]} dark:${categoryColors[project.category]}`}
        >
          {meta?.label || project.category}
        </span>
        {project.private && (
          <span className="inline-flex items-center px-1.5 py-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            <svg
              className="w-3 h-3 mr-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Private
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-1">
        {project.displayName}
      </h3>

      {/* Tagline */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
        {project.tagline}
      </p>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.techStack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center px-2 py-0.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
        <div className="flex items-center gap-3">
          {project.language && (
            <span className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor:
                    languageColors[project.language] || "#6B7280",
                }}
              />
              {project.language}
            </span>
          )}
          {project.stars > 0 && (
            <span className="flex items-center gap-0.5">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {project.stars}
            </span>
          )}
        </div>
        {project.lastUpdated && (
          <span>{formatDate(project.lastUpdated)}</span>
        )}
      </div>

      {/* Live URL indicator */}
      {project.liveUrl && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <span className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live Demo
          </span>
        </div>
      )}
    </Link>
  );
}
