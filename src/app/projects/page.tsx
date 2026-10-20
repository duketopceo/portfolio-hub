import { getEnrichedProjects } from "@/lib/github";
import FilterBar from "@/components/FilterBar";
import { toClientProject } from "@/lib/client-project";
import ConstellationNav from "@/components/ConstellationNav";
import { PageHeader, PageShell, SectionHeading } from "@/components/design";
import { earlierWork } from "@/lib/catalog";
import { publicGithubUrl } from "@/lib/github-public-url";

/** Year each archived repo was created (GitHub createdAt, 2026-10-20 audit). */
const EARLIER_WORK_YEAR: Record<string, number> = {
  "ai-debate-arena": 2026,
  "finance-frenzy": 2025,
  "quiz-the-best": 2025,
  "republic-atlas": 2025,
  "etl-pipeline": 2025,
  "chronicle-weaver": 2025,
  "collaborative-essay": 2026,
};

export const revalidate = 3600;

export const metadata = {
  title: "Projects — System Registry",
  description:
    "Browse all projects: AI automation, trading systems, OSINT platforms, infrastructure, and web apps.",
};

export default async function ProjectsPage() {
  const projects = await getEnrichedProjects();
  const clientProjects = projects.map(toClientProject);
  // Private earlier work is never rendered, not even by name.
  const earlier = earlierWork().filter((p) => !p.private);

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

      <FilterBar projects={clientProjects} />

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
        <ConstellationNav projects={clientProjects} />
      </section>

      <section
        id="earlier-work"
        className="cosmic-page-section"
        aria-labelledby="earlier-work-heading"
      >
        <SectionHeading
          eyebrow="Fig. 03"
          title={<span id="earlier-work-heading">Earlier work</span>}
          description="Archived public repositories. They keep a source link and no dossier."
        />
        <div className="dossier-services overflow-x-auto">
          <table className="dossier-services__table">
            <caption className="sr-only">Earlier work, archived repositories</caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Year</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              {earlier.map((p) => {
                const href = publicGithubUrl(p.private, p.repoName);
                return (
                  <tr key={p.slug}>
                    <th scope="row">{p.displayName}</th>
                    <td>{p.tagline}</td>
                    <td>{EARLIER_WORK_YEAR[p.slug] ?? "—"}</td>
                    <td>
                      {href && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-nav-link"
                        >
                          GitHub ↗
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
