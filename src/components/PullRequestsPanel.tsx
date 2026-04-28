"use client";

import { useEffect, useState } from "react";
import type { PrStatusKind } from "@/lib/github-repo-api";

type Row = {
  repoName: string;
  slug: string;
  displayName: string;
  number: number;
  title: string;
  author: string;
  branch: string;
  updatedAt: string;
  htmlUrl: string;
  draft: boolean;
  status: PrStatusKind;
};

function prAge(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function statusLabel(s: PrStatusKind): string {
  switch (s) {
    case "draft":
      return "Draft";
    case "review_requested":
      return "Review";
    case "approved":
      return "Approved";
    default:
      return "Open";
  }
}

export default function PullRequestsPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/github/pulls", { signal: ac.signal })
      .then((r) => r.json())
      .then((j) => {
        setRows(Array.isArray(j.pulls) ? j.pulls : []);
        setError(null);
      })
      .catch(() => setError("Could not load pull requests."))
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  if (loading) {
    return (
      <p className="cosmic-pr-panel__muted" role="status">
        Loading open PRs…
      </p>
    );
  }
  if (error) {
    return <p className="cosmic-pr-panel__warn">{error}</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="cosmic-pr-panel__muted">
        No open pull requests across catalog repositories.
      </p>
    );
  }

  return (
    <>
      <div className="cosmic-pr-panel__table-wrap" role="region" aria-label="Open pull requests">
        <table className="cosmic-pr-table">
          <thead>
            <tr>
              <th scope="col">Repo</th>
              <th scope="col">PR</th>
              <th scope="col">Author</th>
              <th scope="col">Branch</th>
              <th scope="col">Age</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.repoName}-${r.number}`}>
                <td title={r.displayName}>{r.displayName}</td>
                <td>
                  <a
                    href={r.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cosmic-pr-table__link"
                    title={r.title}
                  >
                    #{r.number} · {r.title}
                  </a>
                </td>
                <td>{r.author}</td>
                <td className="cosmic-pr-table__branch" title={r.branch}>
                  {r.branch}
                </td>
                <td>{prAge(r.updatedAt)}</td>
                <td>
                  <span className={`cosmic-pr-status cosmic-pr-status--${r.status}`}>
                    {statusLabel(r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cosmic-pr-panel__cards" aria-label="Open pull requests">
        {rows.map((r) => (
          <article key={`${r.repoName}-${r.number}-m`} className="cosmic-pr-card">
            <div className="cosmic-pr-card__row">
              <span className="cosmic-pr-card__repo">{r.displayName}</span>
              <span className={`cosmic-pr-status cosmic-pr-status--${r.status}`}>
                {statusLabel(r.status)}
              </span>
            </div>
            <a
              href={r.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-pr-card__title"
            >
              #{r.number} · {r.title}
            </a>
            <dl className="cosmic-pr-card__dl">
              <div>
                <dt>Author</dt>
                <dd>{r.author}</dd>
              </div>
              <div>
                <dt>Branch</dt>
                <dd title={r.branch}>{r.branch}</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>{prAge(r.updatedAt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
