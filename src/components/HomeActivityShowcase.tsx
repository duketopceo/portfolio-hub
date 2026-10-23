"use client";

import { useState } from "react";
import type { HomepageActivityClientPayload } from "@/lib/github-activity-types";
import {
  ACTIVITY_DEFAULT_RANGE,
  activityRangeLabel,
  type ActivityRangeDays,
} from "@/lib/activity-aggregate";
import { ActivityCondensedPanel } from "@/components/activity/ActivityCondensedPanel";
import { ActivityRangeToggle } from "@/components/activity/ActivityRangeToggle";

interface HomeActivityShowcaseProps {
  data: HomepageActivityClientPayload;
}

export function HomeActivityShowcase({ data }: HomeActivityShowcaseProps) {
  const [rangeDays, setRangeDays] = useState<ActivityRangeDays>(
    data.defaultRangeDays ?? ACTIVITY_DEFAULT_RANGE
  );

  const repos = data.repos.map((repo) => ({
    ...repo,
    condensed: repo.byRange[rangeDays],
  }));

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
