import Link from "next/link";
import { ExternalIcon } from "@/components/Icons";

type FeaturedProject = {
  label: string;
  dossierHref: string;
  liveHref?: string;
  liveLabel?: string;
};

const featuredProjects: FeaturedProject[] = [
  {
    label: "Khan",
    dossierHref: "/projects/khan",
    liveHref: "https://khanai.app",
    liveLabel: "khanai.app",
  },
  {
    label: "Kurultai",
    dossierHref: "/projects/kurultai",
    liveHref: "https://github.com/duketopceo/kurultai",
    liveLabel: "GitHub",
  },
  {
    label: "Pace Server",
    dossierHref: "/projects/pace-server",
    liveHref: "https://pacehq.io",
    liveLabel: "pacehq.io",
  },
  {
    label: "OpenRouter demos",
    dossierHref: "/openrouter",
  },
  {
    label: "Stratum",
    dossierHref: "/projects/stratum-hq",
    liveHref: "https://stratumhq.app",
    liveLabel: "stratumhq.app",
  },
];

const siteLinks = [
  { href: "/projects", label: "All projects" },
  { href: "/now", label: "Now" },
  { href: "/about", label: "About" },
  { href: "/hire", label: "Hire" },
  { href: "/resume", label: "Resume" },
];

export default function Footer() {
  return (
    <footer className="cosmic-footer">
      <div className="cosmic-page">
        <div className="cosmic-footer__shop">
          <div className="cosmic-footer__brand">
            <p className="cosmic-footer__brand-name">Cosmic Intelligence</p>
            <p className="cosmic-footer__brand-tag">luke-the-duke.com</p>
          </div>

          <div className="cosmic-footer__buttons" role="list">
            {featuredProjects.map((project) => (
              <div key={project.dossierHref} className="cosmic-footer__btn-wrap" role="listitem">
                <Link href={project.dossierHref} className="cosmic-footer__btn">
                  {project.label}
                </Link>
                {project.liveHref && project.liveLabel ? (
                  <a
                    href={project.liveHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cosmic-footer__btn-live"
                    aria-label={`${project.label} live at ${project.liveLabel}`}
                  >
                    {project.liveLabel}
                    <ExternalIcon className="cosmic-footer__btn-icon" />
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          <nav className="cosmic-footer__nav" aria-label="Site">
            {siteLinks.map((item) => (
              <Link key={item.href} href={item.href} className="cosmic-footer__nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="cosmic-footer__bottom">
          <span>&copy; {new Date().getFullYear()} Cosmic Intelligence</span>
          <span className="cosmic-footer__bottom-sep" aria-hidden>
            ·
          </span>
          <span>Next.js on Railway</span>
        </div>
      </div>
    </footer>
  );
}
