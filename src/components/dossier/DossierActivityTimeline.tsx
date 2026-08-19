"use client";

import { useMemo, useState } from "react";
import type { ProjectActivityPayload } from "@/lib/github-activity-types";
import {
  ACTIVITY_DEFAULT_RANGE,
  activityRangeLabel,
  condenseProjectActivity,
  type ActivityRangeDays,
} from "@/lib/activity-aggregate";
import { ActivityCondensedPanel } from "@/components/activity/ActivityCondensedPanel";
import { ActivityRangeToggle } from "@/components/activity/ActivityRangeToggle";
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
  const [rangeDays, setRangeDays] = useState<ActivityRangeDays>(
    ACTIVITY_DEFAULT_RANGE
  );

  const condensed = useMemo(
    () =>
      condenseProjectActivity(activity, {
        anchorDate: new Date(activity.fetchedAt),
        windowDays: rangeDays,
      }),
    [activity, rangeDays]
  );

  return (
    <section
      className="dossier-timeline cosmic-page"
      aria-labelledby={`timeline-${project.slug}`}
    >
      <div className="dossier-timeline__head">
        <div className="dossier-timeline__head-main">
          <h2 id={`timeline-${project.slug}`} className="dossier-timeline__title">
            GitHub activity
          </h2>
          <p className="dossier-timeline__range-label">
            {activityRangeLabel(rangeDays)} · up to 90d ingested
          </p>
        </div>
        <div className="dossier-timeline__head-actions">
          <ActivityRangeToggle
            value={rangeDays}
            onChange={setRangeDays}
            id={`activity-range-${project.slug}`}
          />
          {isPrivate && (
            <span className="dossier-page__pill dossier-page__pill--muted">
              <LockIcon className="w-3 h-3" />
              Private — scrubbed summaries only
            </span>
          )}
        </div>
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
