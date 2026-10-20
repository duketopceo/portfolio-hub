"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProjectConfig } from "@/lib/types";

/** Featured-work strip for /hire. Poster when the film has one, otherwise a
 *  typographic plate; never a placeholder thumbnail. */
export function FeaturedWork({ projects }: { projects: ProjectConfig[] }) {
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  return (
    <section
      className="hire-featured"
      aria-labelledby="hire-featured-title"
      data-umami-section="Featured work"
    >
      <h2 id="hire-featured-title" className="hire-featured__title">
        Featured work
      </h2>
      <ul className="hire-featured__list">
        {projects.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/projects/${p.slug}`}
              className="hire-featured__item"
              data-umami-event="survey-file-open"
              data-umami-event-slug={p.slug}
              data-umami-event-source="hire"
            >
              {p.film?.poster && !failed.has(p.slug) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.film.poster}
                  alt=""
                  loading="lazy"
                  className="hire-featured__media"
                  onError={() =>
                    setFailed((prev) => new Set(prev).add(p.slug))
                  }
                />
              ) : (
                <span className="hire-featured__plate" aria-hidden="true">
                  {p.displayName}
                </span>
              )}
              <span className="hire-featured__name">{p.displayName}</span>
              <span className="hire-featured__tagline">{p.tagline}</span>
              {p.film && (
                <span className="hire-featured__film">Launch film</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
