import { getRecentProjects } from "@/lib/github";
import ProjectCard from "@/components/ProjectCard";
import PullRequestsPanel from "@/components/PullRequestsPanel";
import { formatDate } from "@/lib/utils";
import { MediaFrame, SectionHeading } from "@/components/design";
import { cx } from "@/components/design/cx";

/** "Now" block for /about#now — recent projects, a track, and open PRs. */
export async function NowSection() {
  const recent = await getRecentProjects(5);

  return (
    <section
      id="now"
      className="cosmic-page-section"
      aria-labelledby="now-heading"
    >
      <SectionHeading
        eyebrow="Now"
        title={<span id="now-heading">What I&apos;m working on</span>}
        description="Last 5 active projects, from GitHub."
      />

      <div
        className="now-spotify-section"
        role="group"
        aria-label="Spotify — current track"
      >
        <div className="now-spotify-card">
          <div className="now-spotify-card__label">
            <span className="now-spotify-card__dot" aria-hidden />
            Listening to
          </div>
          <div className="now-spotify-card__embed">
            <MediaFrame>
              <iframe
                style={{ display: "block" }}
                src="https://open.spotify.com/embed/track/4JXppv83zXXt1tNs4MsXd6?utm_source=generator&theme=0"
                width="100%"
                height={80}
                frameBorder={0}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify track"
              />
            </MediaFrame>
          </div>
        </div>
      </div>

      <div className="cosmic-timeline">
        {recent.map((project, i) => (
          <div
            key={project.slug}
            className="relative flex gap-3 animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className={cx(
                "cosmic-timeline-dot",
                i === 0 && "cosmic-timeline-dot--active",
              )}
            />
            <div className="flex-1 pb-[var(--space-component-2)]">
              <div className="cosmic-timeline__date">
                {project.lastUpdated ? formatDate(project.lastUpdated) : "—"}
                {i === 0 && (
                  <span className="cosmic-timeline__latest">
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

      <div aria-labelledby="now-prs">
        <SectionHeading
          title={<span id="now-prs">Open pull requests</span>}
          description="Across catalog repositories."
        />
        <PullRequestsPanel />
      </div>
    </section>
  );
}
