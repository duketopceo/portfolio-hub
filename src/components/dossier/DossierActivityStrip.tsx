import type { EnrichedProject } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface DossierActivityStripProps {
  project: EnrichedProject;
}

function ciLabel(status: EnrichedProject["ciStatus"]): string | null {
  if (!status) return null;
  switch (status) {
    case "success":
      return "CI passing";
    case "failure":
      return "CI failing";
    case "pending":
      return "CI pending";
    case "unknown":
      return "CI unknown";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function DossierActivityStrip({ project }: DossierActivityStripProps) {
  if (project.siteOnly) return null;

  const ci = ciLabel(project.ciStatus);
  const langs =
    project.languages.length > 0
      ? project.languages
      : project.language
        ? [project.language]
        : [];

  const hasActivity =
    project.lastUpdated || langs.length > 0 || ci || project.openIssuesCount > 0;

  if (!hasActivity) {
    return (
      <div className="dossier-activity dossier-activity--empty" role="status">
        <span className="dossier-activity__label">Activity</span>
        <span className="dossier-activity__muted">
          GitHub metadata unavailable — curated dossier only.
        </span>
      </div>
    );
  }

  return (
    <div className="dossier-activity" aria-label="Repository activity">
      <span className="dossier-activity__label">Activity</span>
      <div className="dossier-activity__items">
        {project.lastUpdated && (
          <span className="dossier-activity__chip">
            Last push {formatDate(project.lastUpdated)}
          </span>
        )}
        {langs.length > 0 && (
          <span className="dossier-activity__chip">
            Languages: {langs.slice(0, 5).join(", ")}
            {langs.length > 5 ? "…" : ""}
          </span>
        )}
        {ci && (
          <span
            className={`dossier-activity__chip dossier-activity__chip--ci dossier-activity__chip--ci-${project.ciStatus}`}
          >
            {ci}
          </span>
        )}
        {project.openIssuesCount > 0 && (
          <span className="dossier-activity__chip">
            {project.openIssuesCount} open issue
            {project.openIssuesCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
