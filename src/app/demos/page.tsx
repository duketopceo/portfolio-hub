import Link from "next/link";
import { demos } from "@/data/demos";
import { PageHeader, PageShell } from "@/components/design";

export const metadata = {
  title: "Demos",
  description:
    "Demo bay — embedded replays, live surfaces, and planned captures across the registry. Replays ship real captured output; nothing here needs a live key.",
};

const tierLabel = { replay: "Replay", live: "Live", planned: "Planned" } as const;

export default function DemosPage() {
  return (
    <PageShell>
      <PageHeader
        metadata={[
          { content: "CI / Demo bay" },
          { content: "Fixture replays + live surfaces", className: "hidden sm:inline" },
          { content: "Sheet 04" },
        ]}
        title="Demo bay"
        lede={
          <>
            Replays run on captured real output — eval ledgers, API responses,
            transcripts — so every surface works offline and leaks no keys. Live
            entries point at production surfaces. Planned entries are dossier
            links until their capture lands.
          </>
        }
      />

      <section className="demo-index" aria-label="Demo registry">
        {demos.map((demo) => (
          <Link
            key={demo.slug}
            href={demo.href}
            className="demo-card"
            {...(demo.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <span className="demo-card__meta">
              <span className={`demo-card__tier demo-card__tier--${demo.tier}`}>
                {tierLabel[demo.tier]}
              </span>
              {demo.external && <span>↗</span>}
            </span>
            <span className="demo-card__name">{demo.name}</span>
            <span className="demo-card__tagline">{demo.tagline}</span>
            {demo.projectSlug && (
              <span className="demo-card__cta">Open demo →</span>
            )}
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
