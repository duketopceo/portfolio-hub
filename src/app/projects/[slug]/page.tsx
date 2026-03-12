import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProjectBySlug,
  getAllSlugs,
  fetchReadme,
} from "@/lib/github";
import {
  formatDate,
  languageColors,
  getGitHubUrl,
} from "@/lib/utils";
import { categoryMeta } from "@/data/projects";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.displayName} — Luke Kimball`,
    description: project.tagline,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const readme = project.private
    ? null
    : await fetchReadme(project.repoName).catch(() => null);

  const meta = categoryMeta[project.category];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link
          href="/projects"
          className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          Projects
        </Link>
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">
          {project.displayName}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
            {meta?.label || project.category}
          </span>
          <span className="text-xs text-zinc-400 capitalize">
            {project.type}
          </span>
          {project.private && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Private
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {project.displayName}
        </h1>

        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
          {project.tagline}
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {!project.private && (
            <a
              href={getGitHubUrl(project.repoName)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              Live Demo
            </a>
          )}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {project.language && (
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1">Language</div>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor:
                    languageColors[project.language] || "#6B7280",
                }}
              />
              {project.language}
            </div>
          </div>
        )}
        {project.lastUpdated && (
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1">Last Updated</div>
            <div className="text-sm font-medium">
              {formatDate(project.lastUpdated)}
            </div>
          </div>
        )}
        {project.stars > 0 && (
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1">Stars</div>
            <div className="text-sm font-medium">{project.stars}</div>
          </div>
        )}
        {project.forks > 0 && (
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1">Forks</div>
            <div className="text-sm font-medium">{project.forks}</div>
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
          Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center px-3 py-1 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* README */}
      {readme && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
            README
          </h2>
          <div
            className="prose-readme text-sm"
            dangerouslySetInnerHTML={{ __html: readme }}
          />
        </div>
      )}

      {/* Private repo notice */}
      {project.private && !readme && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 text-center">
            <svg
              className="w-8 h-8 mx-auto mb-3 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <p className="text-sm text-zinc-500">
              This is a private repository. Source code and README are not
              publicly available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
