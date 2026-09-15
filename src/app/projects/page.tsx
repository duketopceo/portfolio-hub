import { getEnrichedProjects } from "@/lib/github";
import FilterBar from "@/components/FilterBar";
import ConstellationNav from "@/components/ConstellationNav";
import { PageHeader, PageShell, SectionHeading } from "@/components/design";

export const revalidate = 3600;

export const metadata = {
  title: "Projects — System Registry",
  description:
    "Browse all projects: AI automation, trading systems, OSINT platforms, infrastructure, and web apps.",
};

export default async function ProjectsPage() {
  const projects = await getEnrichedProjects();

  return (
    <PageShell>
      <PageHeader
        metadata={[
          { content: "CI / System Registry" },
          { content: `${projects.length} bodies cataloged` },
          { content: "Sheet 02" },
        ]}
        title="System Registry"
        lede="All surveyed bodies — finance, AI, OSINT, infrastructure, web."
      />

      <FilterBar projects={projects} />

      <section
        id="domain-map"
        className="cosmic-page-section"
        aria-labelledby="domain-map-heading"
      >
        <SectionHeading
          eyebrow="Fig. 02"
          title={<span id="domain-map-heading">Sector map</span>}
          description="A 2D chart of how bodies cluster by domain — distinct from the home orbit ordering by completeness."
        />
        <ConstellationNav projects={projects} />
      </section>
    </PageShell>
  );
}
