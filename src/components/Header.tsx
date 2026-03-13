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
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
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
        borderBottom: scrolled
          ? "1px solid var(--glass-border)"
          : "1px solid transparent",
      }}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <div className="flex items-center justify-between" style={{ height: "44px" }}>
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            style={{ textDecoration: "none" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-accent)",
                letterSpacing: "0.05em",
              }}
            >
              ~/portfolio
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
