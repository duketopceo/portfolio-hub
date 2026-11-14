import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import { PageHeader, PageShell } from "@/components/design";
import { rankProjects } from "@/lib/ranking";
import ProjectSphere from "@/components/sphere/ProjectSphere";
import { toSphereProjects } from "@/lib/sphere-projects";

export const revalidate = 3600;

export const metadata = {
  title: "Work as a sphere",
  description: "Every project on one wireframe sphere, one sector per capability group.",
};

export default async function ProjectSpherePage() {
  const projects = await getEnrichedProjects();
  const ranked = rankProjects(projects);

  return (
    <PageShell>
      <PageHeader
        metadata={[{ content: "CI / System Registry" }, { content: `${projects.length} projects` }]}
        title="Work as a sphere"
        lede="The same projects, one sector per capability group."
      />
      <section className="projects-map" aria-label="Project sphere">
        <ProjectSphere projects={toSphereProjects(ranked)} />
      </section>
      <p className="projects-map__switch">
        <Link href="/projects" className="detail-nav-link">
          ← Back to the gravity map
        </Link>
      </p>
    </PageShell>
  );
}
