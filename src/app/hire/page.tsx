export const metadata = {
  title: "Hire",
  description:
    "Hire Luke Kimball — systems builder. Email kimballluke@gmail.com.",
};

export default function HirePage() {
  return (
    <div className="cosmic-page cosmic-page--shell">
      <header
        className="projects-page-header max-w-xl"
        style={{ marginBottom: "clamp(1.5rem, 3vw, 2.5rem)" }}
      >
        <p className="projects-page-header__eyebrow">HIRE</p>
        <h1 className="projects-page-header__title">Let&apos;s work</h1>
        <p className="projects-page-header__sub">
          Open to engineering roles where systems, infrastructure, and
          product-minded operations meet.
        </p>
      </header>

      <div className="cosmic-readable space-y-4">
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          I am available for conversations about full-time engineering,
          infrastructure, and applied-AI roles. Public work lives on this site
          and on GitHub; private dossiers are available in interviews.
        </p>
        <p>
          <a
            href="mailto:kimballluke@gmail.com"
            className="detail-cta inline-flex"
          >
            Email kimballluke@gmail.com
          </a>
        </p>
        <p>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="detail-cta inline-flex"
          >
            Download résumé (PDF)
          </a>
        </p>
      </div>
    </div>
  );
}
