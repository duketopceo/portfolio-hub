"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SunIcon, MoonIcon, MenuIcon, CloseIcon } from "./Icons";

const navItems = [
  { href: "/", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/now", label: "Activity" },
];

export default function Header() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
    // Default stays dark — don't check prefers-color-scheme for default
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }

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
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md transition-colors duration-150"
              style={{ color: "var(--color-text-faint)" }}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1.5 rounded-md"
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
          </nav>
        )}
      </div>
    </header>
  );
}
