"use client";

import { useMemo, useState } from "react";
import type { HomepageActivityPayload } from "@/lib/github-activity-types";
import {
  ACTIVITY_DEFAULT_RANGE,
  activityRangeLabel,
  condenseProjectActivity,
  type ActivityRangeDays,
} from "@/lib/activity-aggregate";
import { ActivityCondensedPanel } from "@/components/activity/ActivityCondensedPanel";
import { ActivityRangeToggle } from "@/components/activity/ActivityRangeToggle";

interface HomeActivityShowcaseProps {
  data: HomepageActivityPayload;
}

export function HomeActivityShowcase({ data }: HomeActivityShowcaseProps) {
  const [rangeDays, setRangeDays] = useState<ActivityRangeDays>(
    data.defaultRangeDays ?? ACTIVITY_DEFAULT_RANGE
  );

  const repos = useMemo(() => {
    const anchor = new Date(data.fetchedAt);
    return data.repos.slice(0, 4).map((repo) => ({
      ...repo,
      condensed: condenseProjectActivity(repo.activity, {
        anchorDate: anchor,
        windowDays: rangeDays,
      }),
    }));
  }, [data.fetchedAt, data.repos, rangeDays]);

  return (
    <div className="activity-strip activity-strip--home">
      <div className="activity-strip__head">
        <div className="activity-strip__label">
          <span className="activity-strip__pulse" aria-hidden />
          {activityRangeLabel(rangeDays)}
        </div>
        <ActivityRangeToggle value={rangeDays} onChange={setRangeDays} />
      </div>

      {repos.length === 0 ? (
        <p className="activity-strip__empty activity-strip__digest-empty">
          GitHub activity unavailable — curated dossiers below
        </p>
      ) : (
        <div className="activity-home-grid">
          {repos.map((repo) => (
            <ActivityCondensedPanel
              key={repo.slug}
              condensed={repo.condensed}
              isPrivate={repo.private}
              variant="home"
              repoName={repo.displayName}
              dossierHref={repo.href}
            />
          ))}
        </div>
      )}

      <span className="activity-strip__meta">
        {data.source === "github"
          ? `via GitHub App · ${data.historyDays}d history cached`
          : data.source}
      </span>
    </div>
  );
}
