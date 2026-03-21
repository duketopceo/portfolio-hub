import { getEnrichedProjects } from "@/lib/github";
import { sortProjectsByCompleteness } from "@/lib/project-completeness";
import ConstellationNav from "@/components/ConstellationNav";
import SolarSystemNav from "@/components/SolarSystemNav";

export const revalidate = 3600;

export default async function Home() {
  const all = await getEnrichedProjects();
  const ordered = sortProjectsByCompleteness(all);
  const liveCount = all.filter((p) => p.liveUrl || p.demoUrl).length;
  const categories = new Set(all.map((p) => p.category));

  return (
    <div>
      {/* ── Hero Section ─────────────────────────── */}
      <section className="cosmic-hero">
        <div className="cosmic-hero__inner">
          <div className="cosmic-hero__orbits" aria-hidden="true">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", color: "var(--color-accent)" }}>
              <ellipse cx="200" cy="200" rx="180" ry="90" stroke="currentColor" strokeWidth="1"/>
              <ellipse cx="200" cy="200" rx="140" ry="60" stroke="currentColor" strokeWidth="0.75"/>
              <ellipse cx="200" cy="200" rx="100" ry="140" stroke="currentColor" strokeWidth="0.5"/>
            </svg>
          </div>

          <h1 className="cosmic-hero__title">
            Cosmic<br />Intelligence
          </h1>
          <p className="cosmic-hero__tagline">
            Systems that <span className="cosmic-hero__accent">compound.</span>
          </p>
          <div className="cosmic-hero__stats">
            <span>{all.length} projects</span>
            <span className="cosmic-hero__dot">·</span>
            <span>{categories.size} domains</span>
            <span className="cosmic-hero__dot">·</span>
            <span>{liveCount} live</span>
          </div>
        </div>
      </section>

      {/* ── Solar orbit (completeness order) ───── */}
      <SolarSystemNav projects={ordered} />

      {/* ── Constellation Navigation ─────────────── */}
      <section
        className="cosmic-page"
        style={{ paddingBottom: "clamp(1rem, 2vw, 1.5rem)" }}
        aria-labelledby="explore-domain-heading"
      >
        <h2 id="explore-domain-heading" className="detail-section-label">
          Explore by domain
        </h2>
        <ConstellationNav projects={all} />
      </section>
    </div>
  );
}
