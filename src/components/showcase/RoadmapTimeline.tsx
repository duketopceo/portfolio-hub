import type { ShowcaseRoadmap } from "@/lib/types";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Beginning, where it is, what is left: three steps in one row on wide
 * screens, stacked on a phone. The source note stays visible.
 */
export default function RoadmapTimeline({ roadmap }: { roadmap?: ShowcaseRoadmap }) {
  if (!roadmap) return null;
  return (
    <div className="showcase-roadmap">
      <h3 className="showcase-roadmap__heading">Roadmap</h3>
      <ol className="showcase-roadmap__steps">
        <li className="showcase-roadmap__step" data-step="started">
          <span className="showcase-roadmap__label">Started</span>
          <time className="showcase-roadmap__date" dateTime={roadmap.started.date}>
            {formatDate(roadmap.started.date)}
          </time>
          <p className="showcase-roadmap__text">{roadmap.started.summary}</p>
        </li>
        <li className="showcase-roadmap__step" data-step="done">
          <span className="showcase-roadmap__label">Done</span>
          <ul className="showcase-roadmap__list">
            {roadmap.done.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </li>
        <li className="showcase-roadmap__step" data-step="remaining">
          <span className="showcase-roadmap__label">Remaining</span>
          {roadmap.next.length > 0 ? (
            <ul className="showcase-roadmap__list">
              {roadmap.next.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="showcase-roadmap__text">Nothing open is listed.</p>
          )}
        </li>
      </ol>
      <p className="showcase-roadmap__source">Source: {roadmap.source}</p>
    </div>
  );
}
