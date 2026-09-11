import { getEnrichedProjects } from "@/lib/github";
import FilterBar from "@/components/FilterBar";
import ConstellationNav from "@/components/ConstellationNav";

export const revalidate = 3600;

export const metadata = {
  title: "Projects — Catalog",
  description:
    "Browse all projects: AI automation, trading systems, OSINT platforms, infrastructure, and web apps.",
};

export default async function ProjectsPage() {
  const projects = await getEnrichedProjects();

  return (
    <div className="cosmic-page cosmic-page--shell">
      <header className="reg-page-head">
        <div className="reg-page-head__margin" aria-hidden="true">
          <span>CI / System Registry</span>
          <span>{projects.length} bodies cataloged</span>
          <span>Sheet 02</span>
        </div>
        <h1 className="reg-page-head__title">System Registry</h1>
        <p className="reg-page-head__sub">
          All surveyed bodies — finance, AI, OSINT, infrastructure, web.
        </p>
      </header>

      <FilterBar projects={projects} />

      <section
        id="domain-map"
        className="cosmic-page-section"
        aria-labelledby="domain-map-heading"
      >
        <h2 id="domain-map-heading" className="detail-section-label">
          <span className="reg-label reg-label--accent">Fig. 02</span> — Sector map
        </h2>
        <p className="cosmic-section-subline">
          A 2D chart of how bodies cluster by domain — distinct from the home
          orbit ordering by completeness.
        </p>
        <ConstellationNav projects={projects} />
      </section>
    </div>
  );
}
