import Link from "next/link";

const siteLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/hire", label: "Hire" },
  { href: "/resume", label: "Resume" },
  { href: "/now", label: "Now" },
  { href: "/contact", label: "Contact" },
];

const leadSystems = [
  { href: "/projects/khan", label: "Khan" },
  { href: "/projects/kurultai", label: "Kurultai" },
  { href: "/projects/pace-server", label: "Pace Server" },
  { href: "/openrouter", label: "OpenRouter" },
  { href: "/projects/stratum-hq", label: "Stratum" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <p
              className="text-lg font-semibold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Cosmic Intelligence
            </p>
            <p
              className="text-sm text-muted-foreground leading-relaxed max-w-xs"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Engineering portfolio for systems that compound across AI,
              trading, OSINT, and production infrastructure.
            </p>
            <p
              className="text-xs text-muted-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Luke Kimball · luke-the-duke.com
            </p>
          </div>

          <div>
            <p
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Site
            </p>
            <nav className="grid grid-cols-2 gap-2" aria-label="Footer site">
              {siteLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Lead systems
            </p>
            <ul className="space-y-2">
              {leadSystems.map((project) => (
                <li key={project.href}>
                  <Link
                    href={project.href}
                    className="text-sm text-foreground hover:text-primary transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {project.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>© {year} COSMIC INTELLIGENCE</span>
          <span>EXO · JETBRAINS MONO · TAILWIND · NEXTJS</span>
        </div>
      </div>
    </footer>
  );
}
