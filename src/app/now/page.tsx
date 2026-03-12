import { getRecentProjects } from "@/lib/github";
import ProjectCard from "@/components/ProjectCard";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = {
  title: "Activity — Engineering Portfolio",
  description:
    "Most recently active projects, updated automatically from commit history.",
};

export default async function NowPage() {
  const recent = await getRecentProjects(5);

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-10">
      <div className="max-w-xl mb-8">
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
            marginBottom: "0.25rem",
          }}
        >
          Recent Activity
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-faint)",
          }}
        >
          Projects with the most recent commits. Updated from GitHub.
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {recent.map((project, i) => (
          <div
            key={project.slug}
            className="flex gap-3 animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center pt-3 flex-shrink-0">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background:
                    i === 0 ? "var(--color-accent)" : "var(--color-surface-3)",
                  border:
                    i === 0
                      ? "2px solid var(--color-accent)"
                      : "2px solid var(--color-border)",
                }}
              />
              {i < recent.length - 1 && (
                <div
                  className="w-px flex-1 mt-1.5"
                  style={{ background: "var(--color-divider)" }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div
                className="flex items-center gap-2 mb-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-faint)",
                }}
              >
                {project.lastUpdated
                  ? formatDate(project.lastUpdated)
                  : "—"}
                {i === 0 && (
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                    style={{
                      color: "var(--color-accent)",
                      background: "var(--color-accent-subtle)",
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full animate-pulse"
                      style={{ background: "var(--color-live)" }}
                    />
                    latest
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
