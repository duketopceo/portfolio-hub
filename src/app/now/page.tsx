import { getRecentProjects } from "@/lib/github";
import ProjectCard from "@/components/ProjectCard";
import { formatDate } from "@/lib/utils";
import {
  MediaFrame,
  PageHeader,
  PageShell,
  SectionHeading,
} from "@/components/design";
import { cx } from "@/components/design/cx";

export const revalidate = 3600;

export const metadata = {
  title: "Activity",
  description:
    "Most recently active projects, updated automatically from commit history.",
};

export default async function NowPage() {
  const recent = await getRecentProjects(5);

  return (
    <PageShell>
      <PageHeader
        metadata={[
          { content: "CI / Mission log" },
          { content: "via GitHub feed", className: "hidden sm:inline" },
          { content: "Sheet 04" },
        ]}
        title="Transmissions"
        lede="Most recently active bodies. Updated from GitHub."
      />

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
      </section>

      <section className="cosmic-timeline" aria-labelledby="now-transmissions">
        <SectionHeading
          eyebrow="Recent activity"
          title={<span id="now-transmissions">Latest repository motion</span>}
          description="Ordered by repository activity rather than promotional priority."
        />
        {recent.map((project, i) => (
          <div
            key={project.slug}
            className="relative flex gap-3 animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Timeline dot */}
            <div
              className={cx(
                "cosmic-timeline-dot",
                i === 0 && "cosmic-timeline-dot--active",
              )}
            />

            {/* Content */}
            <div className="flex-1 pb-8">
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
      </section>
    </PageShell>
  );
}
