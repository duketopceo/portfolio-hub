"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MenuIcon, CloseIcon } from "./Icons";
import { headerNavItems as navItems } from "@/data/site-nav";

/** Live UTC clock — survey status line. */
function useUtcClock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setNow(`${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}Z`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const clock = useUtcClock();

  if (pathname?.startsWith("/podcast")) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="site-header sticky top-0 z-50">
      {/* Status strip — field operation line */}
      <div className="site-header__status">
        <div className="cosmic-page flex items-center justify-between gap-4">
          <span className="site-header__status-item site-header__status-live">
            <span className="site-header__livedot" aria-hidden="true" />
            FIELD OPERATION: ACTIVE
          </span>
          <span className="site-header__status-item hidden sm:inline">
            PROVO, UT / REMOTE
          </span>
          <span className="site-header__status-item hidden md:inline">
            SECTOR: LDK-01
          </span>
          <span className="site-header__status-item" aria-label="UTC time">
            {clock}
          </span>
        </div>
      </div>

      {/* Nav row */}
      <div className="site-header__main">
        <div className="cosmic-page">
          <div className="site-header__bar flex items-center justify-between">
            <Link href="/" className="site-header__brandwrap" aria-label="Cosmic Intelligence home">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                fill="none"
                width="22"
                height="22"
                aria-hidden="true"
                className="site-header__mark"
              >
                <circle cx="24" cy="24" r="3" fill="currentColor" />
                <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1" opacity="0.45" />
                <line x1="24" y1="2" x2="24" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <line x1="24" y1="34" x2="24" y2="46" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <line x1="2" y1="24" x2="14" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <line x1="34" y1="24" x2="46" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <circle cx="36" cy="12" r="1.4" fill="currentColor" opacity="0.7" />
              </svg>
              <span className="site-header__brand">Cosmic Intelligence</span>
            </Link>

            {/* Desktop Nav — indexed mono links */}
            <nav className="site-header__nav hidden md:flex items-center" aria-label="Primary">
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`site-header__link${isActive(item.href) ? " site-header__link--active" : ""}`}
                >
                  <span className="site-header__link-idx">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              ))}

              <a
                href="https://github.com/duketopceo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="site-header__gh"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                </svg>
              </a>
            </nav>

            {/* Mobile menu */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="site-header__menubtn"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <nav className="site-header__mobilenav md:hidden animate-fade-in" aria-label="Mobile">
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`site-header__mobilelink${isActive(item.href) ? " site-header__mobilelink--active" : ""}`}
                >
                  <span className="site-header__link-idx">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              ))}
              <a
                href="https://github.com/duketopceo"
                target="_blank"
                rel="noopener noreferrer"
                className="site-header__mobilelink"
                onClick={() => setMenuOpen(false)}
              >
                <span className="site-header__link-idx">↗</span>
                GitHub
              </a>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
