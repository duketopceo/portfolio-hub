import { getEnrichedProjects } from "@/lib/github";
import FilterBar from "@/components/FilterBar";

export const revalidate = 3600;

export const metadata = {
  title: "Projects — Luke Kimball",
  description: "Browse all projects: AI automation, trading systems, OSINT platforms, infrastructure, and web apps.",
};

export default async function ProjectsPage() {
  const projects = await getEnrichedProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          All Projects
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {projects.length} repositories across finance, AI, OSINT, infrastructure, and web.
        </p>
      </div>

      <FilterBar projects={projects} />
    </div>
  );
}
