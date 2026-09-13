import Link from "next/link";
import {
  basics,
  skills,
  projects,
  work,
  education,
  awards,
} from "@/data/resume";

export function ResumeDocument() {
  return (
    <div className="resume-doc">
      <header className="resume-doc__hero">
        <p className="resume-doc__eyebrow">Applied AI · OpenRouter-native</p>
        <h1 className="resume-doc__name">{basics.name}</h1>
        <p className="resume-doc__label">{basics.label}</p>
        <p className="resume-doc__headline">{basics.headline}</p>

        <ul className="resume-doc__contact">
          <li>
            <a href={`mailto:${basics.email}`}>{basics.email}</a>
          </li>
          <li>
            {basics.location.city}, {basics.location.region} · Remote, US
          </li>
          {basics.profiles.map((p) => (
            <li key={p.url}>
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                {p.network === "GitHub" ? "github.com/duketopceo" : p.username}
              </a>
            </li>
          ))}
        </ul>

        <div className="resume-doc__lead-cta">
          <Link href="/openrouter" className="detail-nav-link">
            OpenRouter demos →
          </Link>
          <Link href="/projects" className="detail-nav-link">
            Project dossiers →
          </Link>
        </div>
      </header>

      <section className="resume-doc__section">
        <h2 className="resume-doc__section-title">Profile</h2>
        <p className="resume-doc__prose">{basics.summary}</p>
      </section>

      <section className="resume-doc__section">
        <h2 className="resume-doc__section-title">Core capabilities</h2>
        <ul className="resume-doc__skills">
          {skills.map((s) => (
            <li key={s.name} className="resume-doc__skill">
              <h3>{s.name}</h3>
              <p>{s.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="resume-doc__section">
        <h2 className="resume-doc__section-title">Selected projects</h2>
        <div className="resume-doc__projects">
          {projects.map((p) => (
            <article key={p.name} className="resume-doc__project">
              <header className="resume-doc__project-head">
                <h3>{p.name}</h3>
                {"caseStudy" in p && p.caseStudy && (
                  p.caseStudy.startsWith(basics.url) ? (
                    <Link href={p.caseStudy.replace(basics.url, "")}>
                      Case study →
                    </Link>
                  ) : (
                    <a href={p.caseStudy} target="_blank" rel="noopener noreferrer">
                      Case study ↗
                    </a>
                  )
                )}
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {new URL(p.url).hostname.replace("www.", "")} ↗
                  </a>
                )}
              </header>
              <p className="resume-doc__prose">{p.description}</p>
              {p.highlights.length > 0 && (
                <ul className="resume-doc__bullets">
                  {p.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              {p.stack.length > 0 && (
                <p className="resume-doc__stack">
                  {p.stack.join(" · ")}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="resume-doc__section">
        <h2 className="resume-doc__section-title">Experience</h2>
        <div className="resume-doc__timeline">
          {work.map((w) => (
            <article key={`${w.company}-${w.position}`} className="resume-doc__role">
              <div className="resume-doc__role-head">
                <h3>
                  {w.position}
                  <span className="resume-doc__role-at"> · {w.company}</span>
                </h3>
                <p className="resume-doc__role-meta">
                  {w.startDate}–{w.endDate} · {w.location}
                </p>
              </div>
              <ul className="resume-doc__bullets">
                {w.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="resume-doc__section resume-doc__section--split">
        <div>
          <h2 className="resume-doc__section-title">Education</h2>
          <ul className="resume-doc__bullets">
            {education.map((e) => (
              <li key={e.institution}>
                <strong>
                  {e.studyType}, {e.area}
                </strong>{" "}
                — {e.institution} ({e.startDate}–{e.endDate})
              </li>
            ))}
          </ul>
        </div>
        {awards.length > 0 && (
          <div>
            <h2 className="resume-doc__section-title">Awards</h2>
            <ul className="resume-doc__bullets">
              {awards.map((a) => (
                <li key={a.title}>
                  <strong>{a.title}</strong> ({a.date}) — {a.summary}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <footer className="resume-doc__formats" aria-label="Machine-readable formats">
        <span className="resume-doc__formats-label">Also available:</span>
        <a href="/resume.json">JSON</a>
        <span aria-hidden>·</span>
        <a href="/resume.md">Markdown</a>
        <span aria-hidden>·</span>
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
          PDF
        </a>
      </footer>
    </div>
  );
}
