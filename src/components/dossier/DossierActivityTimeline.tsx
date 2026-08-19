import Link from "next/link";
import type { EnrichedProject } from "@/lib/types";
import type { ProjectActivityPayload } from "@/lib/github-activity-types";
import { activityKindVerb } from "@/lib/github-activity";
import { LockIcon, ExternalIcon } from "@/components/Icons";
import { formatDate } from "@/lib/utils";

interface DossierActivityTimelineProps {
  project: EnrichedProject;
  activity: ProjectActivityPayload;
}

export function DossierActivityTimeline({
  project,
  activity,
}: DossierActivityTimelineProps) {
  const isPrivate = project.private;

  return (
    <section
      className="dossier-timeline cosmic-page"
      aria-labelledby={`timeline-${project.slug}`}
    >
      <div className="dossier-timeline__head">
        <h2 id={`timeline-${project.slug}`} className="dossier-timeline__title">
          GitHub activity
        </h2>
        {isPrivate && (
          <span className="dossier-page__pill dossier-page__pill--muted">
            <LockIcon className="w-3 h-3" />
            Private — scrubbed summaries only
          </span>
        )}
        <p className="dossier-timeline__headline">{activity.headline}</p>
      </div>

      {activity.days.length > 0 && (
        <div className="dossier-timeline__counts" aria-label="Counts by day">
          {activity.days.map((day) => (
            <div key={day.date} className="dossier-timeline__day-count">
              <span className="dossier-timeline__day-label">{day.date}</span>
              <span className="dossier-timeline__day-stats">
                {day.prsMerged > 0 && (
                  <span>{day.prsMerged} merged</span>
                )}
                {day.prsOpened > 0 && (
                  <span>{day.prsOpened} opened</span>
                )}
                {day.reviews > 0 && (
                  <span>{day.reviews} reviews</span>
                )}
                {day.releases > 0 && (
                  <span>{day.releases} release{day.releases !== 1 ? "s" : ""}</span>
                )}
                {day.issuesOpened > 0 && (
                  <span>{day.issuesOpened} started</span>
                )}
                {day.issuesClosed > 0 && (
                  <span>{day.issuesClosed} finished</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {activity.items.length === 0 ? (
        <p className="dossier-activity__muted">
          No GitHub events in the last 7 days — curated dossier below.
        </p>
      ) : (
        <ol className="dossier-timeline__list">
          {activity.items.map((item) => (
            <li key={item.id} className="dossier-timeline__item">
              <time className="dossier-timeline__time" dateTime={item.at}>
                {formatDate(item.at)}
              </time>
              <div className="dossier-timeline__body">
                <span className="dossier-timeline__kind">
                  {activityKindVerb(item.kind)}
                </span>
                {item.url && !isPrivate ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dossier-timeline__link"
                  >
                    {item.label}
                    <ExternalIcon className="w-3 h-3 inline opacity-60 ml-1" />
                  </a>
                ) : (
                  <span className="dossier-timeline__label">{item.label}</span>
                )}
                {item.mergeTarget && !isPrivate && (
                  <span className="dossier-timeline__target">
                    → {item.mergeTarget}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {!isPrivate && project.githubUrl && (
        <p className="dossier-timeline__foot">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            View repository on GitHub ↗
          </a>
        </p>
      )}

      {isPrivate && (
        <p className="dossier-timeline__foot dossier-activity__muted">
          Private repository — no source, diffs, or PR deep-links.{" "}
          <Link href={`/projects/${project.slug}`} className="detail-nav-link">
            Dossier only
          </Link>
          .
        </p>
      )}
    </section>
  );
}
