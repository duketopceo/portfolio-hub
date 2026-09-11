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

  return (
    <div className="cosmic-page cosmic-page--shell">
      <header className="reg-page-head max-w-xl">
        <div className="reg-page-head__margin" aria-hidden="true">
          <span>CI / Mission log</span>
          <span className="hidden sm:inline">via GitHub feed</span>
          <span>Sheet 04</span>
        </div>
        <h1 className="reg-page-head__title">Transmissions</h1>
        <p className="reg-page-head__sub">
          Most recently active bodies. Updated from GitHub.
        </p>
      </header>

      <section
        className="now-spotify-section"
        aria-label="Spotify — current track"
      >
        <div className="now-spotify-card">
          <div className="now-spotify-card__label">
            <span className="now-spotify-card__dot" aria-hidden />
            On Repeat
          </div>
          <div className="now-spotify-card__embed">
            <iframe
              style={{ borderRadius: 10, display: "block" }}
              src="https://open.spotify.com/embed/track/4JXppv83zXXt1tNs4MsXd6?utm_source=generator&theme=0"
              width="100%"
              height={80}
              frameBorder={0}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify track"
            />
          </div>
        </div>
      </section>

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
