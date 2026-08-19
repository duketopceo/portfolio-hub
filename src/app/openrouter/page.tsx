import Link from "next/link";
import {
  openRouterDemos,
  openRouterOwnerUrl,
} from "@/data/openrouter-demos";

export const metadata = {
  title: "OpenRouter Applications",
  description:
    "Role-aligned OpenRouter application demos — support deflection, GTM motion, and provider bakeoffs with eval-driven scoring.",
};

export default function OpenRouterPage() {
  return (
    <div className="cosmic-page cosmic-page--shell">
      <header
        className="projects-page-header max-w-2xl"
        style={{ marginBottom: "clamp(1.5rem, 3vw, 2.5rem)" }}
      >
        <p className="projects-page-header__eyebrow">OPENROUTER</p>
        <h1 className="projects-page-header__title">Application demos</h1>
        <p className="projects-page-header__sub">
          Three eval-driven demos mapped to OpenRouter application roles. Scores
          and live runs land as repos ship — placeholders below are intentional.
        </p>
      </header>

      <div className="openrouter-grid" role="list">
        {openRouterDemos.map((demo) => (
          <article
            key={demo.slug}
            className="openrouter-card"
            role="listitem"
            style={{ "--card-accent": "#2DD4BF" } as React.CSSProperties}
          >
            <div className="openrouter-card__head">
              <h2 className="openrouter-card__title">{demo.name}</h2>
              <span className="openrouter-card__role">{demo.role}</span>
            </div>

            <p className="openrouter-card__summary">{demo.summary}</p>

            <dl className="openrouter-card__meta">
              <div>
                <dt>Scoring</dt>
                <dd>{demo.scoring}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  {demo.status === "placeholder" ? (
                    <span className="openrouter-card__badge">Placeholder</span>
                  ) : (
                    <span className="openrouter-card__badge openrouter-card__badge--live">
                      Live
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            <footer className="openrouter-card__footer">
              {demo.sourceUrl.startsWith("http") ? (
                <a
                  href={demo.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-nav-link"
                >
                  View source ↗
                </a>
              ) : (
                <Link href={demo.sourceUrl} className="detail-nav-link">
                  On this site
                </Link>
              )}
              {demo.sourceNote && (
                <p className="openrouter-card__note">{demo.sourceNote}</p>
              )}
            </footer>
          </article>
        ))}
      </div>

      <section className="openrouter-footer cosmic-readable max-w-2xl">
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          Demos are built on OpenRouter for model routing and eval loops. Owner
          repos live under{" "}
          <a
            href={openRouterOwnerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            github.com/duketopceo
          </a>
          . When a demo repo goes public, this page will link directly to it.
        </p>
        <p>
          <Link href="/projects" className="detail-nav-link">
            Browse full project catalog →
          </Link>
        </p>
      </section>
    </div>
  );
}
