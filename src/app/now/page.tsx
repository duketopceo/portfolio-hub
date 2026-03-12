import { getRecentProjects } from "@/lib/github";
import ProjectCard from "@/components/ProjectCard";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = {
  title: "Now — Luke Kimball",
  description: "What I'm currently working on — most recently active projects.",
};

export default async function NowPage() {
  const recent = await getRecentProjects(5);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          What I&apos;m Working On
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          The projects with the most recent activity. Updated automatically from
          GitHub commit history.
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {recent.map((project, i) => (
          <div
            key={project.slug}
            className="flex gap-4 animate-fade-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-2">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  i === 0
                    ? "bg-teal-500 border-teal-500"
                    : "bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600"
                }`}
              />
              {i < recent.length - 1 && (
                <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-800 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="text-xs text-zinc-500 mb-2">
                {project.lastUpdated
                  ? formatDate(project.lastUpdated)
                  : "Unknown"}
                {i === 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Most recent
                  </span>
                )}
              </div>
              <ProjectCard project={project} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
