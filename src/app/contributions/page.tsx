import { PageHeader, PageShell } from "@/components/design";
import { UpstreamContributions } from "@/components/UpstreamContributions";
import { getUpstreamContributions } from "@/lib/upstream";

export const revalidate = 3600;

export const metadata = {
  title: "Contributions",
  description:
    "Pull requests Luke has sent to other people's open-source projects, merged, open, and closed.",
};

export default async function ContributionsPage() {
  const data = await getUpstreamContributions();

  return (
    <PageShell>
      <PageHeader
        metadata={[
          { content: "Upstream" },
          { content: "via GitHub search", className: "hidden sm:inline" },
        ]}
        title="Contributions"
        lede="Work sent to other people's projects. Public repositories only."
      />
      <UpstreamContributions data={data} />
    </PageShell>
  );
}
