import Link from "next/link";
import { ExternalIcon } from "@/components/Icons";

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
              <li>
                <Link href="/" className="cosmic-footer__link">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/projects" className="cosmic-footer__link">
                  Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Live Projects */}
          <div>
            <h3 className="cosmic-footer__heading">
              Live Projects
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://republic-atlas.web.app/elections?state=IL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cosmic-footer__link inline-flex items-center gap-1"
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
                  className="cosmic-footer__link inline-flex items-center gap-1"
                >
                  Military Hardware DB
                  <ExternalIcon className="w-2.5 h-2.5 opacity-50" />
                </a>
              </li>
            </ul>
          </div>

          {/* Credits */}
          <div>
            <h3 className="cosmic-footer__heading">
              Credits
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://www.perplexity.ai/computer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cosmic-footer__link inline-flex items-center gap-1"
                >
                  Created with Perplexity
                  <ExternalIcon className="w-2.5 h-2.5 opacity-50" />
                </a>
              </li>
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
                Deployed on Docker Swarm
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────── */}
        <div className="cosmic-footer__bottom">
          Cosmic Intelligence
        </div>
      </div>
    </footer>
  );
}
