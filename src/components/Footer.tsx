import Link from "next/link";
import { ExternalIcon } from "@/components/Icons";
import { listedProjects } from "@/lib/catalog";
import { siteNavItems, SHOW_URL } from "@/data/site-nav";
import { HOMEPAGE_FEATURED_SLUGS } from "@/lib/project-completeness";

type FeaturedProject = {
  label: string;
  dossierHref: string;
  liveHref?: string;
  liveLabel?: string;
};

/** Mirrors the homepage featured five, in the same order. */
const featuredProjects: FeaturedProject[] = HOMEPAGE_FEATURED_SLUGS.flatMap(
  (slug) => {
    const p = listedProjects().find((x) => x.slug === slug);
    if (!p) return [];
    const live =
      p.liveUrl ??
      p.planetVisual?.moons?.find((m) => m.kind === "live" && m.href)?.href;
    return [
      {
        label: p.displayName,
        dossierHref: `/projects/${p.slug}`,
        liveHref: live,
        liveLabel: live ? new URL(live).hostname : undefined,
      },
    ];
  }
);

export default function Footer() {
  return (
    <footer className="cosmic-footer">
      <div className="cosmic-page">
        <div className="cosmic-footer__shop">
          <div className="cosmic-footer__brand">
            <p className="cosmic-footer__brand-name">Cosmic Intelligence</p>
            <p className="cosmic-footer__brand-tag">
              luke-the-duke.com — field registry
            </p>
          </div>

          <div className="cosmic-footer__index" role="list" aria-label="Lead systems">
            {featuredProjects.map((project, i) => (
              <div key={project.dossierHref} className="cosmic-footer__index-row" role="listitem">
                <span className="reg-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Link
                  href={project.dossierHref}
                  className="cosmic-footer__btn"
                  data-umami-event="survey-file-open"
                  data-umami-event-slug={project.label}
                  data-umami-event-source="footer"
                >
                  {project.label}
                </Link>
                {project.liveHref && project.liveLabel ? (
                  <a
                    href={project.liveHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cosmic-footer__btn-live"
                    aria-label={`${project.label} live at ${project.liveLabel}`}
                    data-umami-event="live-site"
                    data-umami-event-slug={project.label}
                  >
                    {project.liveLabel}
                    <ExternalIcon className="cosmic-footer__btn-icon" />
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          <nav className="cosmic-footer__nav" aria-label="Site">
            {siteNavItems.map((item) => (
              <Link key={item.href} href={item.href} className="cosmic-footer__nav-link">
                {item.label}
              </Link>
            ))}
            <a
              href={SHOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-footer__nav-link"
            >
              The Show
            </a>
          </nav>
        </div>

        <div className="cosmic-footer__bottom">
          <span>&copy; {new Date().getFullYear()} Cosmic Intelligence</span>
          <span className="cosmic-footer__bottom-sep" aria-hidden>
            ·
          </span>
          <span>Next.js on Railway</span>
          <span className="cosmic-footer__bottom-sep" aria-hidden>
            ·
          </span>
          <span>Provo, UT · Remote, US</span>
        </div>
      </div>
    </footer>
  );
}
