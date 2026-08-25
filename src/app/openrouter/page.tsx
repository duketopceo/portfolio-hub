import Link from "next/link";
import {
  openRouterDemos,
  OPENROUTER_DEMOS_REPO_URL,
} from "@/data/openrouter-demos";

const KURULTAI_REPO_URL = "https://github.com/duketopceo/kurultai";
import OpenRouterDashboard from "./components/OpenRouterDashboard";
import BdhDossier from "./components/BdhDossier";

export const metadata = {
  title: "OpenRouter Applications",
  description:
    "Portfolio viewer for OpenRouter application demos — fixture summaries, baked coding comparison, and optional live smoke tests. Harness source in openrouter-demos.",
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
          Portfolio viewer for four eval-driven demos mapped to OpenRouter application
          roles — deflection, GTM motion, provider bake-offs, and debate traces. This page
          is <em>not</em> the Python <code>dev_server.py</code> dashboard. Harness source,
          offline pytest, and the local run UI live in{" "}
          <a
            href={OPENROUTER_DEMOS_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            github.com/duketopceo/openrouter-demos
          </a>{" "}
          (<code>python3 dev_server.py</code> →{" "}
          <a
            href="http://localhost:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            localhost:8080
          </a>
          ). Offline pytest is green on fixtures; live evals need{" "}
          <code>OPENROUTER_API_KEY</code>.
        </p>
      </header>

      {/* Portfolio viewer: baked JSON snapshot + optional session-key live smoke test */}
      <OpenRouterDashboard />

      <section className="openrouter-section" aria-labelledby="openrouter-demos-heading">
        <h2 id="openrouter-demos-heading">The job packet</h2>
        <p
          className="muted"
          style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: "1.25rem" }}
        >
          Four role-aligned demos — Deflect, Motion, Bakeoff, Caesar — with
          fixture evals and honest offline status.
        </p>

        <div className="openrouter-grid" role="list">
          {openRouterDemos.map((demo) => (
            <article
              key={demo.slug}
              className="openrouter-card"
              role="listitem"
              style={{ "--card-accent": "#2DD4BF" } as React.CSSProperties}
            >
              <div className="openrouter-card__head">
                <h3 className="openrouter-card__title">{demo.name}</h3>
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

        <p className="openrouter-also-live">
          <span className="openrouter-also-live__label">Also live</span>
          <span>
            Kurultai — a separate Rust knowledge product — uses OpenRouter for
            embeddings and search/rerank (
            <code>OPENROUTER_API_KEY</code>; FTS works without a key).{" "}
            <a
              href={KURULTAI_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-nav-link"
            >
              github.com/duketopceo/kurultai
            </a>
            {" · "}
            <Link href="/projects/kurultai" className="detail-nav-link">
              portfolio dossier
            </Link>
          </span>
        </p>
      </section>

      {/* BDH research dossier — secondary “also on my radar” */}
      <BdhDossier />

      <section className="openrouter-footer cosmic-readable max-w-2xl">
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          This page is a portfolio viewer — it surfaces fixture status, a baked coding
          comparison snapshot, and an optional live smoke test. It does not replace the
          RouteKit harness dashboard. Run offline tests and the full local UI from{" "}
          <a
            href={OPENROUTER_DEMOS_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            github.com/duketopceo/openrouter-demos
          </a>{" "}
          (<code>dev_server.py</code> on{" "}
          <a
            href="http://localhost:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            localhost:8080
          </a>
          ). Live evals require <code>OPENROUTER_API_KEY</code> — this page does not publish
          live accuracy numbers. Beyond these demos,{" "}
          <Link href="/projects/kurultai" className="detail-nav-link">
            Kurultai
          </Link>{" "}
          also consumes OpenRouter for embeddings and search/rerank in production.
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
