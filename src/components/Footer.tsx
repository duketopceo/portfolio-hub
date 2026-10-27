import Link from "next/link";
import { siteNavItems, SHOW_URL } from "@/data/site-nav";

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
