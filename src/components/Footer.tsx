import Link from "next/link";
import { ExternalIcon } from "@/components/Icons";
import { siteNavItems } from "@/data/site-nav";

const liveLinks = [
  {
    label: "Chronicle Weaver",
    href: "https://chronicleweaver.com",
  },
  {
    label: "Republic Atlas",
    href: "https://republicatlas.com",
  },
  {
    label: "Military Hardware DB",
    href: "https://omhdb.luke-the-duke.com/#/",
  },
];

export default function Footer() {
  return (
    <footer className="cosmic-footer">
      <div className="cosmic-page">
        {/* ── Link columns ──────────────────────── */}
        <div className="cosmic-footer__grid">
          {/* Navigation */}
          <div>
            <h3 className="cosmic-footer__heading">
              Navigation
            </h3>
            <ul className="space-y-1">
              {siteNavItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="cosmic-footer__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Live Projects */}
          <div>
            <h3 className="cosmic-footer__heading">
              Live projects
            </h3>
            <ul className="cosmic-footer__live-list space-y-2">
              {liveLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cosmic-footer__link cosmic-footer__live-row inline-flex items-center gap-2"
                  >
                    <span
                      className="cosmic-footer__planet"
                      aria-hidden
                    />
                    <span>{item.label}</span>
                    <ExternalIcon className="w-2.5 h-2.5 opacity-50 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Stack */}
          <div>
            <h3 className="cosmic-footer__heading">
              Stack
            </h3>
            <ul className="space-y-1">
              <li className="cosmic-footer__text">
                Built with Next.js
              </li>
              <li className="cosmic-footer__text">
                Deployed on Railway
              </li>
              <li className="cosmic-footer__text">
                luke-the-duke.com
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────── */}
        <div className="cosmic-footer__bottom">
          &copy; {new Date().getFullYear()} Cosmic Intelligence
        </div>
      </div>
    </footer>
  );
}
