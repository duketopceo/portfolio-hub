"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MenuIcon, CloseIcon } from "./Icons";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/now", label: "Now" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/podcast")) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? "glass" : "bg-transparent"
      }`}
      style={{
        borderTop: "1px solid var(--color-accent-subtle)",
        borderBottom: scrolled
          ? "1px solid var(--glass-border)"
          : "1px solid transparent",
      }}
    >
      <div className="cosmic-page">
        <div className="flex items-center justify-between" style={{ height: "44px" }}>
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            style={{ textDecoration: "none" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              fill="none"
              width="28"
              height="28"
              aria-hidden="true"
              style={{ color: "var(--color-accent)", flexShrink: 0 }}
            >
              <ellipse cx="24" cy="24" rx="20" ry="10" stroke="currentColor" strokeWidth="1" opacity="0.3" transform="rotate(-25 24 24)"/>
              <ellipse cx="24" cy="24" rx="14" ry="7" stroke="currentColor" strokeWidth="1" opacity="0.5" transform="rotate(15 24 24)"/>
              <ellipse cx="24" cy="24" rx="18" ry="5" stroke="currentColor" strokeWidth="0.75" opacity="0.25" transform="rotate(-60 24 24)"/>
              <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="0.5" opacity="0.15"/>
              <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="0.5" opacity="0.15"/>
              <circle cx="24" cy="24" r="3.5" fill="currentColor" opacity="0.9"/>
              <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
              <circle cx="38" cy="19" r="1.5" fill="currentColor" opacity="0.6"/>
              <circle cx="12" cy="30" r="1.2" fill="currentColor" opacity="0.4"/>
              <circle cx="30" cy="32" r="1" fill="currentColor" opacity="0.35"/>
              <path d="M4 8 L4 4 L8 4" stroke="currentColor" strokeWidth="0.75" opacity="0.2" fill="none"/>
              <path d="M40 4 L44 4 L44 8" stroke="currentColor" strokeWidth="0.75" opacity="0.2" fill="none"/>
              <path d="M4 40 L4 44 L8 44" stroke="currentColor" strokeWidth="0.75" opacity="0.2" fill="none"/>
              <path d="M40 44 L44 44 L44 40" stroke="currentColor" strokeWidth="0.75" opacity="0.2" fill="none"/>
            </svg>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--color-text)",
                letterSpacing: "0.08em",
              }}
            >
              COSMIC INTELLIGENCE
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-2.5 py-1 rounded-md transition-colors duration-150"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: isActive(item.href)
                    ? "var(--color-accent)"
                    : "var(--color-text-faint)",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                }}
              >
                {item.label}
                {isActive(item.href) && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px rounded-full"
                    style={{
                      width: "14px",
                      background: "var(--color-accent)",
                    }}
                  />
                )}
              </Link>
            ))}

            {/* GitHub icon link */}
            <a
              href="https://github.com/duketopceo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="flex items-center justify-center w-8 h-8 rounded-md ml-1 transition-colors duration-150"
              style={{ color: "var(--color-text-faint)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-faint)")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
              </svg>
            </a>
          </nav>

          {/* Mobile menu */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-md"
              style={{ color: "var(--color-text-faint)" }}
              aria-label="Toggle menu"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav
            className="md:hidden pb-2 pt-1 animate-fade-in"
            style={{ borderTop: "1px solid var(--color-divider)" }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-1.5 rounded-md"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: isActive(item.href)
                    ? "var(--color-accent)"
                    : "var(--color-text-faint)",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://github.com/duketopceo"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-1.5 rounded-md"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--color-text-faint)",
                textDecoration: "none",
              }}
              onClick={() => setMenuOpen(false)}
            >
              GitHub ↗
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
