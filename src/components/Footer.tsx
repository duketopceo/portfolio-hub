import Link from "next/link";
import { ExternalIcon } from "@/components/Icons";

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        padding: "clamp(1rem, 2vw, 1.5rem) 0",
        borderTop: "1px solid var(--color-divider)",
      }}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        {/* ── Link columns ──────────────────────── */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
          }}
        >
          {/* Navigation */}
          <div>
            <h3
              className="mb-2"
              style={{
                fontWeight: 500,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: "var(--color-text-faint)",
                fontSize: "10px",
              }}
            >
              Navigation
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-[var(--color-text-muted)]"
                  style={{ color: "var(--color-text-faint)", textDecoration: "none" }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="transition-colors hover:text-[var(--color-text-muted)]"
                  style={{ color: "var(--color-text-faint)", textDecoration: "none" }}
                >
                  Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Live Projects */}
          <div>
            <h3
              className="mb-2"
              style={{
                fontWeight: 500,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: "var(--color-text-faint)",
                fontSize: "10px",
              }}
            >
              Live Projects
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://republic-atlas.web.app/elections?state=IL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[var(--color-text-muted)]"
                  style={{ color: "var(--color-text-faint)", textDecoration: "none" }}
                >
                  Republic Atlas
                  <ExternalIcon className="w-2.5 h-2.5 opacity-50" />
                </a>
              </li>
              <li>
                <a
                  href="https://mildb.luke-the-duke.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[var(--color-text-muted)]"
                  style={{ color: "var(--color-text-faint)", textDecoration: "none" }}
                >
                  Military Hardware DB
                  <ExternalIcon className="w-2.5 h-2.5 opacity-50" />
                </a>
              </li>
            </ul>
          </div>

          {/* Credits */}
          <div>
            <h3
              className="mb-2"
              style={{
                fontWeight: 500,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: "var(--color-text-faint)",
                fontSize: "10px",
              }}
            >
              Credits
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://www.perplexity.ai/computer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[var(--color-text-muted)]"
                  style={{ color: "var(--color-text-faint)", textDecoration: "none" }}
                >
                  Created with Perplexity
                  <ExternalIcon className="w-2.5 h-2.5 opacity-50" />
                </a>
              </li>
            </ul>
          </div>

          {/* Stack */}
          <div>
            <h3
              className="mb-2"
              style={{
                fontWeight: 500,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: "var(--color-text-faint)",
                fontSize: "10px",
              }}
            >
              Stack
            </h3>
            <ul className="space-y-1">
              <li style={{ color: "var(--color-text-faint)" }}>
                Built with Next.js
              </li>
              <li style={{ color: "var(--color-text-faint)" }}>
                Deployed on Docker Swarm
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────── */}
        <div
          className="pt-3"
          style={{
            borderTop: "1px solid var(--color-divider)",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--color-text-faint)",
            textAlign: "center" as const,
          }}
        >
          Engineering Portfolio
        </div>
      </div>
    </footer>
  );
}
