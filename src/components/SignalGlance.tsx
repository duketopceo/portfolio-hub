import Link from "next/link";
import { LockIcon } from "@/components/Icons";
import {
  formatAge,
  formatCounts,
  SIGNAL_HEAT_DAYS,
  type SignalRow,
  type SignalSummary,
} from "@/lib/signal-summary";

/**
 * Server-rendered at-a-glance view of what is moving across the projects. No client JS: one row per project, moving above quiet.
 */

function heatLabel(row: SignalRow): string {
  const series = row.heat.map((h) => h.count).join(", ");
  return `${row.events7} events in the last ${SIGNAL_HEAT_DAYS} days, oldest day first: ${series}`;
}

function SignalRowItem({ row }: { row: SignalRow }) {
  const moving = row.state === "moving";
  const counts = formatCounts(row.counts7);
  return (
    <li className="signal__row" data-state={row.state}>
      <div className="signal__who">
        <Link
          href={row.href}
          className="signal__name"
          data-umami-event="signal-project"
          data-umami-event-slug={row.slug}
          data-umami-event-state={row.state}
        >
          {row.displayName}
          {row.private && (
            <LockIcon
              className="inline w-3 h-3 ml-1 opacity-60"
              aria-label="Private repository"
            />
          )}
        </Link>
        <span className="signal__state">{moving ? "Moving" : "Quiet"}</span>
      </div>

      <div className="signal__heat" role="img" aria-label={heatLabel(row)}>
        {row.heat.map((h) => (
          <span
            key={h.date}
            className="signal__bar"
            data-level={h.level}
            title={`${h.date}: ${h.count}`}
          />
        ))}
      </div>

      <p className="signal__counts">
        {moving ? (
          <>
            <strong>{row.events7}</strong> in 7d
            {counts ? <span className="signal__break"> · {counts}</span> : null}
          </>
        ) : row.events30 > 0 ? (
          <>
            <strong>{row.events30}</strong> in 30d
          </>
        ) : (
          "No events in 30d"
        )}
      </p>

      <p className="signal__last">
        {row.lastKind && row.lastLine && row.lastAt ? (
          <>
            <span className="signal__line">{row.lastLine}</span>
            <time className="signal__age" dateTime={row.lastAt}>
              {formatAge(row.lastAgeDays)}
            </time>
          </>
        ) : (
          <span className="signal__line">No recent events</span>
        )}
      </p>
    </li>
  );
}

export function SignalGlance({ summary }: { summary: SignalSummary }) {
  if (summary.rows.length === 0) {
    return (
      <div className="signal">
        <p className="signal__empty">
          GitHub activity unavailable — curated dossiers below
        </p>
      </div>
    );
  }

  const moving = summary.rows.filter((r) => r.state === "moving");
  const quiet = summary.rows.filter((r) => r.state === "quiet");

  return (
    <div className="signal">
      <p className="signal__headline" aria-live="off">
        {summary.movingCount === 0 ? (
          <strong>Nothing moving this week</strong>
        ) : (
          <>
            <strong>
              {summary.movingCount} of {summary.totalCount}
            </strong>{" "}
            projects moving · {summary.events7} events in 7 days
          </>
        )}
      </p>

      {moving.length > 0 && (
        <section aria-labelledby="signal-moving-heading">
          <h3 id="signal-moving-heading" className="signal__group">
            Moving now · last 7 days
          </h3>
          <ol className="signal__list">
            {moving.map((row) => (
              <SignalRowItem key={row.slug} row={row} />
            ))}
          </ol>
          {summary.hiddenMovingCount > 0 && (
            <p className="signal__meta">
              <Link
                href={summary.moreHref}
                data-umami-event="signal-more-moving"
              >
                +{summary.hiddenMovingCount} more moving
              </Link>
            </p>
          )}
        </section>
      )}

      {quiet.length > 0 && (
        <section aria-labelledby="signal-quiet-heading">
          <h3 id="signal-quiet-heading" className="signal__group">
            Quiet · nothing in 7 days
          </h3>
          <ol className="signal__list">
            {quiet.map((row) => (
              <SignalRowItem key={row.slug} row={row} />
            ))}
          </ol>
        </section>
      )}

      <p className="signal__meta">
        Commits, PRs, releases and issues ·{" "}
        {summary.source === "github" ? "via GitHub" : summary.source} · as of{" "}
        <time dateTime={summary.fetchedAt}>
          {summary.fetchedAt.slice(0, 10)}
        </time>
      </p>
    </div>
  );
}
