import { getEnrichedProjects } from "@/lib/github";
import FilterBar from "@/components/FilterBar";

export const revalidate = 3600;

export const metadata = {
  title: "Projects — Engineering Portfolio",
  description:
    "Browse all projects: AI automation, trading systems, OSINT platforms, infrastructure, and web apps.",
};

export default async function ProjectsPage() {
  const projects = await getEnrichedProjects();

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-10">
      <div className="mb-6">
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
            marginBottom: "0.25rem",
          }}
        >
          All Projects
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-faint)",
          }}
        >
          {projects.length} repositories across finance, AI, OSINT,
          infrastructure, and web.
        </p>
      </div>

      <FilterBar projects={projects} />
    </div>
  );
}
