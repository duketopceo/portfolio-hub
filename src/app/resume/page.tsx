import { basics, skills, projects, work, education, awards } from "@/data/resume";

export const metadata = {
  title: "Résumé — Luke Kimball",
  description:
    "Luke Kimball — Applied AI Engineer. OpenRouter-native multi-model routing, agent harnesses, LLM infrastructure. Full résumé available as HTML, JSON, Markdown, and PDF.",
  alternates: { canonical: `${basics.url}/resume` },
};

// JSON-LD Person schema — structured identity for AI parsers and search engines.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: basics.name,
  jobTitle: basics.label,
  description: basics.summary,
  url: basics.url,
  email: `mailto:${basics.email}`,
  telephone: `+1${basics.phone.replace(/[^0-9]/g, "")}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: basics.location.city,
    addressRegion: basics.location.region,
    addressCountry: basics.location.countryCode,
  },
  sameAs: basics.profiles.map((p) => p.url),
  knowsAbout: skills.flatMap((s) => s.keywords),
  worksFor: work.map((w) => ({
    "@type": "Organization",
    name: w.company,
    employee: { "@type": "EmployeeRole", roleName: w.position },
  })),
};

export default function ResumePage() {
  return (
    <div className="cosmic-page cosmic-page--shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header
        className="projects-page-header max-w-2xl"
        style={{ marginBottom: "clamp(1.5rem, 3vw, 2.5rem)" }}
      >
        <p className="projects-page-header__eyebrow">RÉSUMÉ</p>
        <h1 className="projects-page-header__title">{basics.name}</h1>
        <p className="projects-page-header__sub">{basics.label}</p>
        <p
          style={{
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
            marginTop: "0.5rem",
          }}
        >
          {basics.headline}
        </p>
      </header>

      {/* Format switcher — machines and humans both reach the same data */}
      <nav
        aria-label="Résumé formats"
        className="cosmic-readable"
        style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}
      >
        <a className="detail-cta inline-flex" href="/resume.json">
          JSON Resume
        </a>
        <a className="detail-cta inline-flex" href="/resume.md">
          Markdown
        </a>
        <a
          className="detail-cta inline-flex"
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          PDF
        </a>
      </nav>

      <article className="cosmic-readable" style={{ lineHeight: 1.7 }}>
        {/* Contact */}
        <p style={{ color: "var(--color-text-muted)" }}>
          {basics.phone} · {basics.email} · {basics.location.city}, {basics.location.region}{" "}
          (Remote, US)
        </p>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem" }}>
          {basics.profiles.map((p) => (
            <li key={p.url}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-accent)" }}
              >
                {p.network}: {p.username}
              </a>
            </li>
          ))}
        </ul>

        {/* Profile */}
        <section>
          <h2 style={h2}>Profile</h2>
          <p>{basics.summary}</p>
        </section>

        {/* Core Capabilities */}
        <section>
          <h2 style={h2}>Core Capabilities</h2>
          <ul>
            {skills.map((s) => (
              <li key={s.name} style={{ marginBottom: "0.4rem" }}>
                <strong>{s.name}</strong> — {s.detail}
              </li>
            ))}
          </ul>
        </section>

        {/* Projects */}
        <section>
          <h2 style={h2}>Selected Projects</h2>
          {projects.map((p) => (
            <div key={p.name} style={{ marginBottom: "1rem" }}>
              <h3 style={h3}>
                {p.name}{" "}
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--color-accent)", fontSize: "0.9em" }}
                  >
                    {new URL(p.url).hostname}
                  </a>
                )}
              </h3>
              <p>{p.description}</p>
              {p.highlights.length > 0 && (
                <ul>
                  {p.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
              {p.stack.length > 0 && (
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9em" }}>
                  Stack: {p.stack.join(", ")}.
                </p>
              )}
            </div>
          ))}
        </section>

        {/* Experience */}
        <section>
          <h2 style={h2}>Experience</h2>
          {work.map((w) => (
            <div key={w.company + w.position} style={{ marginBottom: "1rem" }}>
              <h3 style={h3}>
                {w.position} — {w.company}
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9em" }}>
                {w.startDate}–{w.endDate} · {w.location}
              </p>
              <ul>
                {w.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Education */}
        <section>
          <h2 style={h2}>Education</h2>
          <ul>
            {education.map((e) => (
              <li key={e.institution}>
                <strong>{e.studyType}, {e.area}</strong> — {e.institution} (
                {e.startDate}–{e.endDate})
              </li>
            ))}
          </ul>
        </section>

        {awards.length > 0 && (
          <section>
            <h2 style={h2}>Awards</h2>
            <ul>
              {awards.map((a) => (
                <li key={a.title}>
                  <strong>{a.title}</strong> ({a.date}) — {a.summary}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}

const h2: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  marginTop: "1.75rem",
  marginBottom: "0.5rem",
  paddingBottom: "0.25rem",
  borderBottom: "1px solid var(--color-border, rgba(255,255,255,0.12))",
};
const h3: React.CSSProperties = {
  fontSize: "1.05rem",
  fontWeight: 600,
  marginTop: "0.75rem",
  marginBottom: "0.25rem",
};
