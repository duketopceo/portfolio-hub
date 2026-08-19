export const metadata = {
  title: "Contact",
  description:
    "Contact Luke Kimball — kimballluke@gmail.com, Provo UT. GitHub and LinkedIn links.",
};

export default function ContactPage() {
  return (
    <div className="cosmic-page cosmic-page--shell contact-page">
      <header className="contact-page__header">
        <p className="projects-page-header__eyebrow">CONTACT</p>
        <h1 className="projects-page-header__title">Get in touch</h1>
        <p className="contact-page__lede">
          Email is the hire path. GitHub and LinkedIn are the public work.
        </p>
      </header>

      <div className="contact-page__grid">
        <div className="contact-page__card">
          <h2>Email</h2>
          <a href="mailto:kimballluke@gmail.com" className="detail-cta">
            kimballluke@gmail.com
          </a>
        </div>
        <div className="contact-page__card">
          <h2>Phone</h2>
          <a href="tel:+15597897214" className="detail-nav-link">
            559-789-7214
          </a>
        </div>
        <div className="contact-page__card">
          <h2>Location</h2>
          <p>Provo, UT · Remote, US</p>
        </div>
        <div className="contact-page__card">
          <h2>Links</h2>
          <ul>
            <li>
              <a
                href="https://github.com/duketopceo"
                target="_blank"
                rel="noopener noreferrer"
                className="detail-nav-link"
              >
                github.com/duketopceo ↗
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/in/lukekimball2789"
                target="_blank"
                rel="noopener noreferrer"
                className="detail-nav-link"
              >
                linkedin.com/in/lukekimball2789 ↗
              </a>
            </li>
            <li>
              <a href="/resume" className="detail-nav-link">
                Web résumé →
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
