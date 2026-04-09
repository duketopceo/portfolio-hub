"use client";

import { useEffect, useState } from "react";

interface ActivityEvent {
  repo: string;
  branch: string;
  message: string;
  count: number;
  timestamp: string;
}

function relativeTime(iso: string): string {
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

function Skeleton() {
  return (
    <div className="activity-feed__skeleton">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="activity-feed__skeleton-row">
          <div className="activity-feed__skeleton-line activity-feed__skeleton-line--short" />
          <div className="activity-feed__skeleton-line activity-feed__skeleton-line--long" />
          <div className="activity-feed__skeleton-line activity-feed__skeleton-line--medium" />
        </div>
      ))}
    </div>
  );
}

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((data) => {
        setEvents((data.events || []).slice(0, 10));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="activity-feed">
      <div className="activity-feed__header">
        <span className="activity-feed__label">Recent Activity</span>
      </div>

      <div className="activity-feed__list">
        {loading ? (
          <Skeleton />
        ) : events.length === 0 ? (
          <p className="activity-feed__empty">No recent activity</p>
        ) : (
          events.map((event, i) => (
            <div key={`${event.repo}-${event.timestamp}-${i}`} className="activity-feed__item">
              <span className="activity-feed__time">
                {relativeTime(event.timestamp)}
              </span>
              <span className="activity-feed__message">
                {event.message || `${event.count} commit${event.count !== 1 ? "s" : ""} to ${event.branch}`}
              </span>
              <span className="activity-feed__repo">
                {event.repo} / {event.branch}
              </span>
              {i < events.length - 1 && (
                <span className="activity-feed__dot" aria-hidden="true" />
              )}
            </div>
          ))
        )}
      </div>

      <a
        href="https://github.com/duketopceo"
        target="_blank"
        rel="noopener noreferrer"
        className="activity-feed__view-all"
      >
        View all &rarr;
      </a>
    </div>
  );
}
