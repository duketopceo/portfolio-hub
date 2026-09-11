"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { EnrichedProject } from "@/lib/types";
import { formatDate, languageColors } from "@/lib/utils";
import type { CiStateKind, PrStatusKind } from "@/lib/github-repo-api";

type SummaryResponse = {
  repo: string;
  slug: string;
  displayName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string;
  private: boolean;
  githubPath: string;
  pulls: Array<{
    number: number;
    title: string;
    author: string;
    branch: string;
    updatedAt: string;
    htmlUrl: string;
    draft: boolean;
    status: PrStatusKind;
  }>;
  ci: CiStateKind;
  ciSha: string | null;
};

function prAge(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
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

function ciLabel(ci: CiStateKind): string {
  switch (ci) {
    case "success":
      return "CI passing";
    case "failure":
    case "error":
      return "CI failing";
    case "pending":
      return "CI pending";
    case "skipped":
      return "CI skipped";
    default:
      return "CI unknown";
  }
}

interface RepoDetailModalProps {
  project: EnrichedProject;
  open: boolean;
  onClose: () => void;
}

export default function RepoDetailModal({
  project,
  open,
  onClose,
}: RepoDetailModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset stale data when the modal re-opens or the target repo changes —
  // derived-state-during-render, per React docs (avoids sync setState in effect).
  const [prevKey, setPrevKey] = useState<string | null>(null);
  const fetchKey = open ? project.repoName : null;
  if (prevKey !== fetchKey) {
    setPrevKey(fetchKey);
    setData(null);
    setError(null);
    setLoading(fetchKey !== null);
  }

  useEffect(() => {
    if (!open) return;
    const ac = new AbortController();
    const url = `/api/github/repo/${encodeURIComponent(project.repoName)}/summary`;
    fetch(url, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((json) => setData(json as SummaryResponse))
      .catch(() => setError("Could not load GitHub details."))
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [open, project.repoName]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    queueMicrotask(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  if (!open || !mounted) return null;

  const langColor = project.language
    ? languageColors[project.language] || "#6B7280"
    : null;

  return createPortal(
    <div
      className="cosmic-modal"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="cosmic-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="cosmic-modal__head">
          <div className="cosmic-modal__head-row">
            <h2 id={titleId} className="cosmic-modal__title" title={project.displayName}>
              <span className="cosmic-modal__title-text">{project.displayName}</span>
            </h2>
            <button
              type="button"
              className="cosmic-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="cosmic-modal__path" title={data?.githubPath ?? project.repoName}>
            {data?.githubPath ?? project.repoName}
          </p>
        </header>

        <div className="cosmic-modal__body">
          {loading && (
            <p className="cosmic-modal__muted">Loading GitHub…</p>
          )}
          {error && !loading && (
            <p className="cosmic-modal__warn">{error}</p>
          )}
          {data && !loading && (
            <>
              {data.description && (
                <p className="cosmic-modal__desc">{data.description}</p>
              )}
              <dl className="cosmic-modal__stats">
                <div>
                  <dt>Language</dt>
                  <dd>
                    {data.language ? (
                      <span className="cosmic-modal__lang">
                        <span
                          className="cosmic-card-pill__dot"
                          style={{ backgroundColor: langColor || "#6B7280" }}
                          aria-hidden
                        />
                        {data.language}
                      </span>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Stars</dt>
                  <dd>{data.stars}</dd>
                </div>
                <div>
                  <dt>Forks</dt>
                  <dd>{data.forks}</dd>
                </div>
                <div>
                  <dt>Open issues</dt>
                  <dd>{data.openIssues}</dd>
                </div>
                <div>
                  <dt>Last push</dt>
                  <dd>
                    {data.pushedAt ? formatDate(data.pushedAt) : "—"}
                  </dd>
                </div>
                <div>
                  <dt>CI (default branch)</dt>
                  <dd>
                    <span className={`cosmic-ci cosmic-ci--${data.ci}`}>
                      {ciLabel(data.ci)}
                    </span>
                  </dd>
                </div>
              </dl>

              <h3 className="cosmic-modal__sub">Open pull requests</h3>
              {data.pulls.length === 0 ? (
                <p className="cosmic-modal__muted">No open PRs.</p>
              ) : (
                <ul className="cosmic-modal__pr-list">
                  {data.pulls.map((pr) => (
                    <li key={pr.number} className="cosmic-modal__pr">
                      <a
                        href={pr.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cosmic-modal__pr-link"
                      >
                        <span className="cosmic-modal__pr-title" title={pr.title}>
                          #{pr.number} · {pr.title}
                        </span>
                        <span className={`cosmic-pr-status cosmic-pr-status--${pr.status}`}>
                          {statusLabel(pr.status)}
                        </span>
                      </a>
                      <div className="cosmic-modal__pr-meta">
                        <span>{pr.author}</span>
                        <span title={pr.branch}>{pr.branch}</span>
                        <span>{prAge(pr.updatedAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <div className="cosmic-modal__actions">
            <Link
              href={`/projects/${project.slug}`}
              className="cosmic-modal__cta"
              onClick={onClose}
            >
              Open full dossier →
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
