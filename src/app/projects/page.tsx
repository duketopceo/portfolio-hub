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
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16 sm:py-20">
      <div className="mb-10">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-3xl)",
            fontWeight: 700,
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem",
          }}
        >
          All Projects
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
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
