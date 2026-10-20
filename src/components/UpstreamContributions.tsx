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

const CELL = "px-3 py-2 align-top max-sm:block max-sm:px-0 max-sm:py-0";
const MONO = "font-mono text-[var(--text-xs)] text-[var(--color-text-muted)]";

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
          className="border-t border-[var(--color-divider)] max-sm:flex max-sm:flex-wrap max-sm:gap-x-3 max-sm:py-3"
        >
          <td className={`${CELL} ${MONO} max-sm:order-2`}>{pr.repo}</td>
          <td className={`${CELL} max-sm:order-1 max-sm:w-full`}>
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text)] hover:text-[var(--color-accent)]"
            >
              {pr.title}
            </a>
          </td>
          <td className={`${CELL} ${MONO} max-sm:order-3`}>{state}</td>
          <td className={`${CELL} ${MONO} max-sm:order-4`}>
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
    <table className="w-full border-collapse text-left text-[var(--text-sm)]">
      <caption className="sr-only">{label}</caption>
      <thead className="max-sm:sr-only">
        <tr className={MONO}>
          <th scope="col" className="px-3 py-2 font-normal">Repository</th>
          <th scope="col" className="px-3 py-2 font-normal">Title</th>
          <th scope="col" className="px-3 py-2 font-normal">State</th>
          <th scope="col" className="px-3 py-2 font-normal">Date</th>
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
      <details className="mt-10">
        <summary className="cursor-pointer font-mono text-[var(--text-sm)] text-[var(--color-text-muted)]">
          {heading}
        </summary>
        <div className="mt-4">
          <PrTable rows={rows} state={state} label={title} />
        </div>
      </details>
    );
  }
  const head = rows.slice(0, OPEN_VISIBLE);
  const rest = state === "Open" ? rows.slice(OPEN_VISIBLE) : [];
  const shown = state === "Open" ? head : rows;
  return (
    <section className="mt-10" aria-label={title}>
      <SectionHeading title={heading} />
      <div className="mt-4">
        <PrTable rows={shown} state={state} label={title} />
        {rest.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer font-mono text-[var(--text-sm)] text-[var(--color-text-muted)]">
              Show {rest.length} more open
            </summary>
            <div className="mt-2">
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
    <section className="mt-10" aria-label="Other contributions">
      <SectionHeading title="Other contributions" />
      <ul className="mt-4 divide-y divide-[var(--color-divider)]">
        {UPSTREAM_CURATED.map((item) => (
          <li
            key={item.title}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3"
          >
            <StatusMark>{item.type}</StatusMark>
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text)] hover:text-[var(--color-accent)]"
              >
                {item.title}
              </a>
            ) : (
              <span className="text-[var(--color-text)]">{item.title}</span>
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
          className="mt-10 border border-[var(--color-border)] px-4 py-3 font-mono text-[var(--text-sm)] text-[var(--color-text-muted)]"
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
