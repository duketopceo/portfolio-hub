"use client";

import Link from "next/link";
import type {
  ActivityGroupRow,
  CondensedActivity,
} from "@/lib/activity-aggregate";
import { formatTotalsLine, showcaseKindLabel } from "@/lib/activity-aggregate";
import { ActivityDayChart } from "@/components/activity/ActivityDayChart";
import { ExternalIcon, LockIcon } from "@/components/Icons";
import { formatDate } from "@/lib/utils";

interface ActivityCondensedPanelProps {
  condensed: CondensedActivity;
  isPrivate: boolean;
  headline?: string;
  githubUrl?: string;
  dossierHref?: string;
  variant?: "dossier" | "home";
  repoName?: string;
}

function ShowcaseRow({
  row,
  isPrivate,
}: {
  row: ActivityGroupRow;
  isPrivate: boolean;
}) {
  return (
    <li className="activity-condensed__showcase-item">
      <span className="activity-condensed__badge">
        {showcaseKindLabel(row.primaryKind)}
      </span>
      {row.url && !isPrivate ? (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="activity-condensed__row-link"
        >
          {row.label}
          <ExternalIcon className="w-3 h-3 inline opacity-60 ml-1" />
        </a>
      ) : (
        <span className="activity-condensed__row-label">{row.label}</span>
      )}
      <time className="activity-condensed__row-time" dateTime={row.at}>
        {formatDate(row.at)}
      </time>
    </li>
  );
}

function GroupedRow({
  row,
  isPrivate,
}: {
  row: ActivityGroupRow;
  isPrivate: boolean;
}) {
  return (
    <li className="activity-condensed__grouped-item">
      {row.url && !isPrivate ? (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="activity-condensed__row-link"
        >
          {row.label}
        </a>
      ) : (
        <span className="activity-condensed__row-label">{row.label}</span>
      )}
      {row.mergeTarget && !isPrivate && (
        <span className="activity-condensed__target">→ {row.mergeTarget}</span>
      )}
    </li>
  );
}

export function ActivityCondensedPanel({
  condensed,
  isPrivate,
  headline,
  githubUrl,
  dossierHref,
  variant = "dossier",
  repoName,
}: ActivityCondensedPanelProps) {
  const totalsLine = formatTotalsLine(condensed.totals);
  const hasActivity =
    condensed.showcase.length > 0 || condensed.grouped.length > 0;

  if (variant === "home") {
    const totalsLine = formatTotalsLine(condensed.totals);

    return (
      <article className="activity-home-card">
        <div className="activity-home-card__head">
          {dossierHref ? (
            <Link href={dossierHref} className="activity-home-card__title">
              {repoName}
              {isPrivate && (
                <LockIcon
                  className="inline w-3 h-3 ml-1 opacity-60"
                  aria-label="Private repository"
                />
              )}
            </Link>
          ) : (
            <span className="activity-home-card__title">{repoName}</span>
          )}
          <p className="activity-home-card__totals">{totalsLine}</p>
        </div>
        <ActivityDayChart days={condensed.days} compact />
        {condensed.showcase.length > 0 && (
          <ul className="activity-home-card__showcase">
            {condensed.showcase.slice(0, 2).map((row) => (
              <li key={row.id}>
                <span className="activity-condensed__badge activity-condensed__badge--sm">
                  {showcaseKindLabel(row.primaryKind)}
                </span>
                <span className="activity-home-card__highlight">{row.label}</span>
              </li>
            ))}
          </ul>
        )}
        {condensed.grouped.length > 0 && dossierHref && (
          <Link href={dossierHref} className="activity-home-card__more">
            + {condensed.grouped.length} in flight →
          </Link>
        )}
      </article>
    );
  }

  return (
    <div className="activity-condensed">
      {(headline || totalsLine) && (
        <p className="activity-condensed__summary">
          {headline ?? totalsLine}
        </p>
      )}

      <ActivityDayChart days={condensed.days} id="activity-week-chart" />

      {!hasActivity ? (
        <p className="dossier-activity__muted">
          No GitHub events in the last 7 days — curated dossier below.
        </p>
      ) : (
        <>
          {condensed.showcase.length > 0 && (
            <section
              className="activity-condensed__showcase"
              aria-label="Standout activity"
            >
              <h3 className="activity-condensed__section-label">Standout</h3>
              <ul className="activity-condensed__showcase-list">
                {condensed.showcase.map((row) => (
                  <ShowcaseRow key={row.id} row={row} isPrivate={isPrivate} />
                ))}
              </ul>
            </section>
          )}

          {condensed.grouped.length > 0 && (
            <details className="activity-condensed__more">
              <summary>
                {condensed.grouped.length} more — reviews &amp; in-flight
              </summary>
              <ul className="activity-condensed__grouped-list">
                {condensed.grouped.map((row) => (
                  <GroupedRow key={row.id} row={row} isPrivate={isPrivate} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}

      {!isPrivate && githubUrl && (
        <p className="dossier-timeline__foot">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            View repository on GitHub ↗
          </a>
        </p>
      )}

      {isPrivate && dossierHref && (
        <p className="dossier-timeline__foot dossier-activity__muted">
          Private repository — no source, diffs, or PR deep-links.{" "}
          <Link href={dossierHref} className="detail-nav-link">
            Dossier only
          </Link>
          .
        </p>
      )}
    </div>
  );
}
