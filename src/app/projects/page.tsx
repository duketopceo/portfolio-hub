import { getEnrichedProjects } from "@/lib/github";
import FilterBar from "@/components/FilterBar";

export const revalidate = 3600;

export const metadata = {
  title: "Projects — Cosmic Intelligence",
  description:
    "Browse all projects: AI automation, trading systems, OSINT platforms, infrastructure, and web apps.",
};

export default async function ProjectsPage() {
  const projects = await getEnrichedProjects();

  return (
    <div className="cosmic-page py-16 sm:py-20">
      <header className="projects-page-header mb-12">
        <div className="projects-page-header__orbit" aria-hidden="true">
          <svg viewBox="0 0 200 200" fill="none" width="220" height="220">
            <ellipse
              cx="100" cy="100" rx="90" ry="45"
              stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.08"
              transform="rotate(-20 100 100)"
            />
            <ellipse
              cx="100" cy="100" rx="65" ry="30"
              stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.12"
              transform="rotate(15 100 100)"
            />
            <circle cx="100" cy="100" r="4" fill="var(--color-accent)" opacity="0.2" />
          </svg>
        </div>
        <p className="projects-page-header__eyebrow">CATALOG</p>
        <h1 className="projects-page-header__title">All Projects</h1>
        <p className="projects-page-header__sub">
          <span className="projects-page-header__stat">{projects.length}</span>{" "}
          repositories across finance, AI, OSINT, infrastructure, and web.
        </p>
      </header>

      <FilterBar projects={projects} />
    </div>
  );
}
