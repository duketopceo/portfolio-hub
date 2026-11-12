import { getEnrichedProjects } from "@/lib/github";
import { buildGravityMap } from "@/lib/gravity-map";
import { GravityMap } from "@/components/GravityMap";
import { PageHeader, PageShell } from "@/components/design";

export const revalidate = 3600;

export const metadata = {
  title: "Gravity map",
  description:
    "Every project plotted by mass: finished products at the centre, ten category fields orbiting them.",
};

/**
 * Gravity map view — an alternate reading of the same catalog, not a separate
 * dataset. Categories are fields of gravity; finished products sit on their own
 * ring. The homepage keeps its orbital survey; this is the shape of the work.
 */
export default async function GravityPage() {
  const projects = await getEnrichedProjects();
  const map = buildGravityMap(projects);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Catalog / Gravity map"
        title={
          <>
            {map.heroes.length} finished products.
            <br />
            {map.centres.length} fields of gravity.
          </>
        }
        lede={
          <>
            {map.heroes.length} finished products at the centre,{" "}
            {map.total - map.heroes.length} more catalogued across{" "}
            {map.centres.length} category fields. Hover a body for the detail.
          </>
        }
        metadata={[
          { content: "CI / Gravity map" },
          { content: `${map.total} repos`, className: "hidden sm:inline" },
          { content: "Sheet 05" },
        ]}
      />
      <GravityMap data={map} />
    </PageShell>
  );
}
