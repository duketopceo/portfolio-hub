import Link from "next/link";
import {
  openRouterDemos,
  OPENROUTER_DEMOS_REPO_URL,
} from "@/data/openrouter-demos";
import OpenRouterDashboard from "./components/OpenRouterDashboard";
import BdhDossier from "./components/BdhDossier";

export const metadata = {
  title: "OpenRouter Applications",
  description:
    "Role-aligned OpenRouter application demos — Guardrails deflection, GTM motion with Auto Router, and provider bake-offs with eval-driven scoring.",
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
          Four eval-driven demos mapped to OpenRouter application roles —
          grounded in daily operator workflows (Auto Router, presets,
          Guardrails, bake-offs, debate traces). Source lives in{" "}
          <a
            href={OPENROUTER_DEMOS_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            openrouter-demos
          </a>
          ; offline pytest is green on fixtures.
        </p>
      </header>

      {/* Interactive dashboard: baked bakeoff + session-key live tests */}
      <OpenRouterDashboard />

      {/* BDH research dossier */}
      <BdhDossier />

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
                  {demo.status === "fixtures" ? (
                    <span className="openrouter-card__badge">
                      Fixtures (offline)
                    </span>
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
          These demos reflect how OpenRouter is used day to day — routing,
          presets, guardrails, and bake-offs — not a self-hosted inference
          cluster. Run offline tests from{" "}
          <a
            href={OPENROUTER_DEMOS_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            github.com/duketopceo/openrouter-demos
          </a>
          . Live evals require <code>OPENROUTER_API_KEY</code> — this page does
          not publish live accuracy numbers.
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
