import { PageHeader, PageShell } from "@/components/design";
import { OrbitLabScene } from "@/components/lab/OrbitLabScene";
import { buildLabOrbitPlanets } from "@/lib/lab-orbit-rings";
import { getEnrichedProjects } from "@/lib/github";

export const revalidate = 3600;

export const metadata = {
  title: "Orbit lab",
  description:
    "Prototype: a lightweight SVG orbit map of the portfolio catalog — lab route only.",
  robots: { index: false, follow: false },
};

export default async function OrbitLabPage() {
  const projects = await getEnrichedProjects();
  const planets = buildLabOrbitPlanets(projects);

  return (
    <PageShell measure="wide">
      <PageHeader
        metadata={[
          { content: "CI / Lab" },
          { content: "Prototype" },
          { content: "Sheet —" },
        ]}
        eyebrow="Experiment"
        title="Orbit map"
        lede="A clean-room solar-system sketch of the catalog: featured worlds on the inner ellipse, active systems mid-ring, plugins and tools on the outer belt. Hover or focus a planet to pause it; click through to the dossier."
      />

      <section aria-label="Orbit prototype" className="cosmic-page-section">
        <OrbitLabScene planets={planets} />
      </section>
    </PageShell>
  );
}
