import Link from "next/link";
import type { HomepageActivityPayload } from "@/lib/github-activity-types";
import { ActivityCondensedPanel } from "@/components/activity/ActivityCondensedPanel";

interface HomeActivityShowcaseProps {
  data: HomepageActivityPayload;
}

export function HomeActivityShowcase({ data }: HomeActivityShowcaseProps) {
  const repos = data.repos.slice(0, 4);

  return (
    <div className="activity-strip activity-strip--home">
      <div className="activity-strip__label">
        <span className="activity-strip__pulse" aria-hidden />
        Last 7 days
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
        {data.source === "github" ? "via GitHub App" : data.source}
      </span>
    </div>
  );
}
