import Link from "next/link";

export const metadata = {
  title: "Hire",
  description:
    "Hire Luke Kimball — applied AI and systems engineering. Email kimballluke@gmail.com or read the web résumé.",
};

export default function HirePage() {
  return (
    <div className="cosmic-page cosmic-page--shell hire-page">
      <header className="hire-page__header">
        <p className="projects-page-header__eyebrow">HIRE</p>
        <h1 className="projects-page-header__title">Let&apos;s work</h1>
        <p className="hire-page__lede">
          Open to full-time engineering roles where applied AI, infrastructure,
          and product-minded operations meet. Public work lives here and on
          GitHub; private dossiers available in conversation.
        </p>
      </header>

      <div className="hire-page__actions">
        <a href="mailto:kimballluke@gmail.com" className="detail-cta">
          Email kimballluke@gmail.com
        </a>
        <Link href="/resume" className="detail-cta detail-cta--secondary">
          View web résumé
        </Link>
      </div>

      <div className="hire-page__secondary">
        <p>
          Prefer a print copy?{" "}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            Download PDF ↗
          </a>
        </p>
        <p>
          Demos and case studies:{" "}
          <Link href="/openrouter" className="detail-nav-link">
            OpenRouter applications
          </Link>
          {" · "}
          <Link href="/projects" className="detail-nav-link">
            full catalog
          </Link>
        </p>
      </div>
    </div>
  );
}
