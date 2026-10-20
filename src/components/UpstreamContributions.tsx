import { SectionHeading, StatusMark } from "@/components/design";
import { UPSTREAM_CURATED } from "@/data/upstream-curated";
import type { UpstreamContributionsData, UpstreamPr } from "@/lib/upstream";

const OPEN_VISIBLE = 10;

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateFormat.format(d);
}

const MONO = "upstream__meta";

function PrRows({
  rows,
  state,
}: {
  rows: UpstreamPr[];
  state: "Merged" | "Open" | "Closed";
}) {
  return (
    <>
      {rows.map((pr) => (
        <tr
          key={`${pr.repo}#${pr.number}`}
          className="upstream__row"
        >
          <td className={`upstream__cell ${MONO} upstream__cell--repo`}>{pr.repo}</td>
          <td className="upstream__cell upstream__cell--title">
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="upstream__link"
            >
              {pr.title}
            </a>
          </td>
          <td className={`upstream__cell ${MONO} upstream__cell--state`}>{state}</td>
          <td className={`upstream__cell ${MONO} upstream__cell--date`}>
            {formatDate(pr.date)}
          </td>
        </tr>
      ))}
    </>
  );
}

function PrTable({
  rows,
  state,
  label,
}: {
  rows: UpstreamPr[];
  state: "Merged" | "Open" | "Closed";
  label: string;
}) {
  return (
    <table className="upstream__table">
      <caption className="sr-only">{label}</caption>
      <thead className="upstream__head">
        <tr className={MONO}>
          <th scope="col" className="upstream__th">Repository</th>
          <th scope="col" className="upstream__th">Title</th>
          <th scope="col" className="upstream__th">State</th>
          <th scope="col" className="upstream__th">Date</th>
        </tr>
      </thead>
      <tbody>
        <PrRows rows={rows} state={state} />
      </tbody>
    </table>
  );
}

function Group({
  title,
  rows,
  state,
}: {
  title: string;
  rows: UpstreamPr[];
  state: "Merged" | "Open" | "Closed";
}) {
  if (rows.length === 0) return null;
  const heading = `${title} (${rows.length})`;
  if (state === "Closed") {
    return (
      <details className="upstream__section">
        <summary className="upstream__summary">
          {heading}
        </summary>
        <div className="upstream__body">
          <PrTable rows={rows} state={state} label={title} />
        </div>
      </details>
    );
  }
  const head = rows.slice(0, OPEN_VISIBLE);
  const rest = state === "Open" ? rows.slice(OPEN_VISIBLE) : [];
  const shown = state === "Open" ? head : rows;
  return (
    <section className="upstream__section" aria-label={title}>
      <SectionHeading title={heading} />
      <div className="upstream__body">
        <PrTable rows={shown} state={state} label={title} />
        {rest.length > 0 && (
          <details className="upstream__more">
            <summary className="upstream__summary">
              Show {rest.length} more open
            </summary>
            <div className="upstream__body">
              <PrTable rows={rest} state={state} label={`${title}, continued`} />
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

function Curated() {
  return (
    <section className="upstream__section" aria-label="Other contributions">
      <SectionHeading title="Other contributions" />
      <ul className="upstream__curated">
        {UPSTREAM_CURATED.map((item) => (
          <li
            key={item.title}
            className="upstream__curated-item"
          >
            <StatusMark>{item.type}</StatusMark>
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="upstream__link"
              >
                {item.title}
              </a>
            ) : (
              <span className="upstream__title">{item.title}</span>
            )}
            <span className={MONO}>
              {item.target} · {item.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function UpstreamContributions({
  data,
}: {
  data: UpstreamContributionsData | null;
}) {
  return (
    <div>
      {data ? (
        <>
          <Group title="Merged" rows={data.merged} state="Merged" />
          <Group title="Open" rows={data.open} state="Open" />
          <Group title="Closed without merge" rows={data.closed} state="Closed" />
        </>
      ) : (
        <p
          role="status"
          className="upstream__notice"
        >
          Pull request data is unavailable right now. Check back shortly.
        </p>
      )}
      <Curated />
    </div>
  );
}

/** Compact {merged, open} strip for /hire (U7). Never shows zero on failure. */
export function UpstreamSummary({
  data,
}: {
  data: UpstreamContributionsData | null;
}) {
  return (
    <p className={MONO}>
      {data
        ? `${data.merged.length} merged · ${data.open.length} open pull requests upstream`
        : "Upstream pull request counts unavailable"}
    </p>
  );
}
