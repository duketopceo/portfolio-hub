import Link from "next/link";
import type { EnrichedProject } from "@/lib/types";

interface DossierFooterNavProps {
  prev: EnrichedProject | null;
  next: EnrichedProject | null;
}

/**
 * Standard prev/next rail at the bottom of every project dossier.
 */
export function DossierFooterNav({ prev, next }: DossierFooterNavProps) {
  return (
    <nav
      className="dossier-page__footer-nav cosmic-page"
      aria-label="Adjacent projects"
    >
      {prev ? (
        <Link href={`/projects/${prev.slug}`} className="detail-nav-link">
          <span className="dossier-page__nav-arrow" aria-hidden>
            ←
          </span>
          <span className="dossier-page__nav-text">
            <span className="dossier-page__nav-label">Previous</span>
            <span className="dossier-page__nav-title">{prev.displayName}</span>
          </span>
        </Link>
      ) : (
        <span className="dossier-page__nav-spacer" />
      )}
      {next ? (
        <Link
          href={`/projects/${next.slug}`}
          className="detail-nav-link dossier-page__nav-link--next"
        >
          <span className="dossier-page__nav-text dossier-page__nav-text--next">
            <span className="dossier-page__nav-label">Next</span>
            <span className="dossier-page__nav-title">{next.displayName}</span>
          </span>
          <span className="dossier-page__nav-arrow" aria-hidden>
            →
          </span>
        </Link>
      ) : (
        <span className="dossier-page__nav-spacer" />
      )}
    </nav>
  );
}
