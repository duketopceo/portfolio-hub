import Link from "next/link";
import { PageHeader, PageShell, TransmissionClose } from "@/components/design";

export const metadata = {
  title: "About",
  description:
    "Luke Kimball — OpenRouter-native systems builder in Provo, UT. Cosmic Intelligence portfolio at luke-the-duke.com.",
};

const navLinkClass = "detail-nav-link";

export default function AboutPage() {
  return (
    <PageShell measure="readable">
      <PageHeader
        metadata={[
          { content: "CI / Operator file" },
          { content: "Provo, UT", className: "hidden sm:inline" },
          { content: "Sheet 05" },
        ]}
        eyebrow="Transmission"
        title="Luke Kimball"
        lede="OpenRouter-native systems builder · Provo, UT"
      />

      <div className="cosmic-readable space-y-5">
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.75 }}>
          I build systems that compound — agent harnesses, knowledge layers,
          production platforms, and the honest ops story around them. Routing
          goes through OpenRouter and real APIs; I am not running a home GPU
          cluster or self-hosted inference farm.
        </p>

        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.75 }}>
          By day I am an IT Support and Data Specialist at{" "}
          <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>
            Bartlett Roofing
          </strong>{" "}
          — a ~200-person organization, not a portfolio of 200 projects. The
          work on this site is personal engineering under{" "}
          <a
            href="https://github.com/duketopceo"
            target="_blank"
            rel="noopener noreferrer"
            className={navLinkClass}
          >
            duketopceo
          </a>
          .
        </p>

        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.75 }}>
          <Link href="/" className={navLinkClass}>
            Cosmic Intelligence
          </Link>{" "}
          at luke-the-duke.com is the public map: five featured worlds in the
          main orbit, ~20 more in the catalog ring, dossiers for every repo, and
          a live GitHub activity view — ingest the history, display it
          structured, not as a fake “last week only” strip.
        </p>

        <TransmissionClose
          title="Where to go next"
          actions={
            <>
              <Link href="/projects" className={navLinkClass}>
                Projects →
              </Link>
              <Link href="/openrouter" className={navLinkClass}>
                OpenRouter demos →
              </Link>
              <Link href="/resume" className={navLinkClass}>
                Résumé →
              </Link>
              <Link href="/hire" className={navLinkClass}>
                Hire →
              </Link>
              <Link href="/contact" className={navLinkClass}>
                Contact →
              </Link>
              <a
                href="https://github.com/duketopceo"
                target="_blank"
                rel="noopener noreferrer"
                className={navLinkClass}
              >
                GitHub ↗
              </a>
              <a
                href="https://linkedin.com/in/lukekimball2789"
                target="_blank"
                rel="noopener noreferrer"
                className={navLinkClass}
              >
                LinkedIn ↗
              </a>
            </>
          }
        >
          Follow the evidence path: registry, dossier, mission briefing, then
          contact.
        </TransmissionClose>
      </div>
    </PageShell>
  );
}
