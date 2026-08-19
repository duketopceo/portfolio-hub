import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "Luke Kimball — systems builder. Personal engineering work at luke-the-duke.com.",
};

export default function AboutPage() {
  return (
    <div className="cosmic-page cosmic-page--shell">
      <header
        className="projects-page-header max-w-xl"
        style={{ marginBottom: "clamp(1.5rem, 3vw, 2.5rem)" }}
      >
        <p className="projects-page-header__eyebrow">WHO</p>
        <h1 className="projects-page-header__title">Luke Kimball</h1>
        <p className="projects-page-header__sub">
          Systems builder. Personal engineering portfolio.
        </p>
      </header>

      <div className="cosmic-readable space-y-4">
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          I build systems that compound — AI infrastructure, open-source tools,
          and the operational layer that keeps them honest. This site is the
          public record of that work: curated projects, dossiers, and a direct
          hire path.
        </p>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          I currently work as an IT Support and Data Specialist at Bartlett
          Roofing. The projects here are personal duketopceo work, not an
          employer catalog.
        </p>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          If you are hiring for someone who can ship, operate, and explain
          systems, start at{" "}
          <Link href="/resume" className="detail-nav-link">
            /resume
          </Link>{" "}
          or{" "}
          <Link href="/hire" className="detail-nav-link">
            /hire
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
