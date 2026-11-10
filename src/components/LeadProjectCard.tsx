import Link from "next/link";
import { categoryMeta } from "@/data/category-meta";
import { isProjectLive } from "@/lib/deployments";
import { mediaAsset, type EnrichedProject } from "@/lib/types";
import { catColors } from "@/lib/utils";

/**
 * One of the three lead projects (KTD3). Every card has the same footprint:
 * a fixed-ratio figure over a fixed body. With a video the figure is the
 * poster and a play affordance that opens the dossier's video section (never
 * autoplay); without one it is the project's typographic block.
 */
export default function LeadProjectCard({
  project,
  rank,
}: {
  project: EnrichedProject;
  /** One-based ranking position. */
  rank: number;
}) {
  const meta = categoryMeta[project.category];
  const video = mediaAsset(project.media.release) ?? mediaAsset(project.media.demo);
  const dossier = `/projects/${project.slug}`;
  const href = video ? `${dossier}#video` : dossier;
  const accent = catColors[project.category] || "#2DD4BF";
  const live = isProjectLive(project);

  return (
    <article
      className="lead-card"
      style={{ "--card-accent": accent } as React.CSSProperties}
      data-lead-rank={rank}
      data-has-video={video ? "true" : "false"}
    >
      <Link
        href={href}
        className="lead-card__figure"
        prefetch={false}
        aria-label={
          video
            ? `Watch the ${project.displayName} video`
            : `Open the ${project.displayName} dossier`
        }
        data-umami-event="lead-card-open"
        data-umami-event-slug={project.slug}
        data-umami-event-kind={video ? "video" : "dossier"}
      >
        {video?.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.poster}
            alt=""
            className="lead-card__poster"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="lead-card__type" aria-hidden>
            {project.displayName}
          </span>
        )}
        {video && (
          <span className="lead-card__play" aria-hidden>
            <svg className="lead-card__play-icon" viewBox="0 0 10 10" aria-hidden>
              <path d="M1.5 0.5 9 5 1.5 9.5z" />
            </svg>
            Watch
          </span>
        )}
      </Link>

      <div className="lead-card__body">
        <p className="lead-card__kicker">
          <span className="lead-card__rank">{String(rank).padStart(2, "0")}</span>
          <span>{meta?.label ?? project.category}</span>
          {live && <span className="lead-card__live">Live</span>}
        </p>
        <h3 className="lead-card__title">
          <Link href={dossier} prefetch={false}>
            {project.displayName}
          </Link>
        </h3>
        <p className="lead-card__tagline">{project.tagline}</p>
        <Link
          href={dossier}
          className="lead-card__cta detail-nav-link"
          prefetch={false}
        >
          Open dossier →
        </Link>
      </div>
    </article>
  );
}
