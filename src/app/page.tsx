import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import { getHomepageOrbitProjects } from "@/lib/project-completeness";
import { getHomepageActivityShowcase } from "@/lib/github-activity";
import { isProjectLive } from "@/lib/deployments";
import SolarSystemNav from "@/components/SolarSystemNav";
import { HomeActivityShowcase } from "@/components/HomeActivityShowcase";

export const revalidate = 3600;

export default async function Home() {
  const all = await getEnrichedProjects();
  const ordered = getHomepageOrbitProjects(all);
  const activity = await getHomepageActivityShowcase();
  const liveCount = all.filter(isProjectLive).length;
  const categories = new Set(all.map((p) => p.category));
  const lead = ordered[0];

  return (
    <div>
      {/* ── Home: compact hero + full-viewport solar universe ── */}
      <div className="home-universe">
        <section className="cosmic-hero cosmic-hero--compact">
          <div className="cosmic-hero__inner">
            <div className="cosmic-hero__orbits" aria-hidden="true">
              <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", color: "var(--color-accent)" }}>
                <ellipse cx="200" cy="200" rx="180" ry="90" stroke="currentColor" strokeWidth="1"/>
                <ellipse cx="200" cy="200" rx="140" ry="60" stroke="currentColor" strokeWidth="0.75"/>
                <ellipse cx="200" cy="200" rx="100" ry="140" stroke="currentColor" strokeWidth="0.5"/>
              </svg>
            </div>

            <p className="cosmic-hero__eyebrow">Luke Kimball</p>
            <h1 className="cosmic-hero__title">
              Cosmic<br />Intelligence
            </h1>
            <p className="cosmic-hero__tagline">
              Systems that <span className="cosmic-hero__accent">compound.</span>
            </p>
            {lead && (
              <p className="cosmic-hero__lead">
                Lead system · {lead.displayName}
              </p>
            )}
            <div className="cosmic-hero__stats" aria-label="Portfolio summary">
              <span>{all.length} repositories</span>
              <span className="cosmic-hero__dot">·</span>
              <span>{categories.size} domains</span>
              <span className="cosmic-hero__dot">·</span>
              <span>{liveCount} live</span>
            </div>
          </div>
        </section>

        <SolarSystemNav key={lead?.slug ?? "orbit"} projects={ordered} />
      </div>

      {/* ── Activity strip — below orbit, full width ── */}
      <div className="home-activity-strip">
        <HomeActivityShowcase data={activity} />
      </div>

      <section
        className="cosmic-page home-domain-hint"
        aria-label="Domain map in catalog"
      >
        <Link href="/projects#domain-map" className="detail-nav-link">
          Explore domain quadrant map →
        </Link>
      </section>
    </div>
  );
}
