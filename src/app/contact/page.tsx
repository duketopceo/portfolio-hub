export const metadata = {
  title: "Contact",
  description:
    "Contact Luke Kimball at kimballluke@gmail.com or github.com/duketopceo.",
};

export default function ContactPage() {
  return (
    <div className="cosmic-page cosmic-page--shell">
      <header
        className="projects-page-header max-w-xl"
        style={{ marginBottom: "clamp(1.5rem, 3vw, 2.5rem)" }}
      >
        <p className="projects-page-header__eyebrow">CONTACT</p>
        <h1 className="projects-page-header__title">Get in touch</h1>
        <p className="projects-page-header__sub">
          One address. No form, no wait.
        </p>
      </header>

      <div className="cosmic-readable space-y-4">
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          Email is the hire path. GitHub is the public work.
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
            href="https://github.com/duketopceo"
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            github.com/duketopceo ↗
          </a>
        </p>
      </div>
    </div>
  );
}
