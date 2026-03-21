import { getRecentProjects } from "@/lib/github";
import ProjectCard from "@/components/ProjectCard";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = {
  title: "Activity",
  description:
    "Most recently active projects, updated automatically from commit history.",
};

export default async function NowPage() {
  const recent = await getRecentProjects(5);
  const hasGitHubDates = recent.some((p) => Boolean(p.lastUpdated?.trim()));

  return (
    <div className="cosmic-page py-16 sm:py-20">
      <header className="projects-page-header max-w-xl mb-12">
        <p className="projects-page-header__eyebrow">MISSION LOG</p>
        <h1 className="projects-page-header__title">Recent Activity</h1>
        <p className="projects-page-header__sub">
          Projects with the most recent commits. Updated from GitHub.
        </p>
      </header>

      {!hasGitHubDates && recent.length > 0 && (
        <div
          className="max-w-xl mb-8 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--glass-border)",
            background: "var(--glass-bg)",
            color: "var(--color-text-muted)",
          }}
          role="status"
        >
          <strong style={{ color: "var(--color-text)" }}>
            GitHub timeline unavailable.
          </strong>{" "}
          Showing curated projects in catalog order. For live commit dates on this
          page, set{" "}
          <code className="text-xs" style={{ color: "var(--color-accent)" }}>
            GITHUB_TOKEN
          </code>{" "}
          in the server environment (e.g.{" "}
          <code className="text-xs">~/portfolio-hub/.env</code> on the cluster) and
          rebuild the container.
        </div>
      )}

      {/* Timeline */}
      <div className="cosmic-timeline">
        {recent.map((project, i) => (
          <div
            key={project.slug}
            className="relative flex gap-3 animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Timeline dot */}
            <div
              className={`cosmic-timeline-dot${i === 0 ? " cosmic-timeline-dot--active" : ""}`}
            />

            {/* Content */}
              <div className="flex-1 pb-8">
              <div
                className="flex items-center gap-2 mb-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--color-text-faint)",
                }}
              >
                {project.lastUpdated ? formatDate(project.lastUpdated) : "—"}
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
