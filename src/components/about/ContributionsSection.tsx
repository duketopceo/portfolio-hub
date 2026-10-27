import { SectionHeading } from "@/components/design";
import { UpstreamContributions } from "@/components/UpstreamContributions";
import { getUpstreamContributions } from "@/lib/upstream";

/** "Open-source contributions" block for /about#contributions. */
export async function ContributionsSection() {
  const data = await getUpstreamContributions();
  return (
    <section
      id="contributions"
      className="cosmic-page-section"
      aria-labelledby="contributions-heading"
    >
      <SectionHeading
        eyebrow="Upstream"
        title={<span id="contributions-heading">Open-source contributions</span>}
        description="Work sent to other people's projects. Public repositories only."
      />
      <UpstreamContributions data={data} />
    </section>
  );
}
