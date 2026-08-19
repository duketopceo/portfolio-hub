import Link from "next/link";
import type { ProjectActivityPayload } from "@/lib/github-activity-types";
import type { CondensedActivity } from "@/lib/activity-aggregate";
import { condenseProjectActivity } from "@/lib/activity-aggregate";
import { ActivityCondensedPanel } from "@/components/activity/ActivityCondensedPanel";
import { LockIcon } from "@/components/Icons";
import type { EnrichedProject } from "@/lib/types";

interface DossierActivityTimelineProps {
  project: EnrichedProject;
  activity: ProjectActivityPayload;
}

export function DossierActivityTimeline({
  project,
  activity,
}: DossierActivityTimelineProps) {
  const isPrivate = project.private;
  const condensed: CondensedActivity = condenseProjectActivity(activity, {
    anchorDate: new Date(activity.fetchedAt),
  });

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
      </div>

      <ActivityCondensedPanel
        condensed={condensed}
        isPrivate={isPrivate}
        headline={activity.headline}
        githubUrl={project.githubUrl ?? undefined}
        dossierHref={`/projects/${project.slug}`}
        variant="dossier"
      />
    </section>
  );
}
