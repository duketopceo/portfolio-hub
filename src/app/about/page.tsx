import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "Luke Kimball — OpenRouter-native systems builder in Provo, UT. Cosmic Intelligence portfolio at luke-the-duke.com.",
};

const externalLink = "detail-nav-link";

export default function AboutPage() {
  return (
    <div className="cosmic-page cosmic-page--shell">
      <header
        className="projects-page-header max-w-xl"
        style={{ marginBottom: "clamp(1.5rem, 3vw, 2.5rem)" }}
      >
        <p className="projects-page-header__eyebrow">WHO</p>
        <h1 className="projects-page-header__title">Luke Kimball</h1>
        <p className="projects-page-header__sub">
          OpenRouter-native systems builder · Provo, UT
        </p>
      </header>

      <div className="cosmic-readable space-y-5">
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.75 }}>
          I build systems that compound — agent harnesses, knowledge layers,
          production platforms, and the honest ops story around them. Routing
          goes through OpenRouter and real APIs; I am not running a home GPU
          cluster or self-hosted inference farm.
        </p>

        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.75 }}>
          By day I am an IT Support and Data Specialist at{" "}
          <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>
            Bartlett Roofing
          </strong>{" "}
          — a ~200-person organization, not a portfolio of 200 projects. The
          work on this site is personal engineering under{" "}
          <a
            href="https://github.com/duketopceo"
            target="_blank"
            rel="noopener noreferrer"
            className={externalLink}
          >
            duketopceo
          </a>
          .
        </p>

        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.75 }}>
          <Link href="/" className={externalLink}>
            Cosmic Intelligence
          </Link>{" "}
          at luke-the-duke.com is the public map: five featured worlds in the
          main orbit, ~20 more in the catalog ring, dossiers for every repo, and
          a live GitHub activity view — ingest the history, display it
          structured, not as a fake “last week only” strip.
        </p>

        <nav
          className="about-links"
          aria-label="Where to go next"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem 1.25rem",
            paddingTop: "0.5rem",
          }}
        >
          <Link href="/projects" className={externalLink}>
            Projects →
          </Link>
          <Link href="/openrouter" className={externalLink}>
            OpenRouter demos →
          </Link>
          <Link href="/resume" className={externalLink}>
            Résumé →
          </Link>
          <Link href="/hire" className={externalLink}>
            Hire →
          </Link>
          <Link href="/contact" className={externalLink}>
            Contact →
          </Link>
          <a
            href="https://github.com/duketopceo"
            target="_blank"
            rel="noopener noreferrer"
            className={externalLink}
          >
            GitHub ↗
          </a>
          <a
            href="https://linkedin.com/in/lukekimball2789"
            target="_blank"
            rel="noopener noreferrer"
            className={externalLink}
          >
            LinkedIn ↗
          </a>
        </nav>
      </div>
    </div>
  );
}
