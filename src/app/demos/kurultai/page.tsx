import Link from "next/link";
import fixture from "@/data/kurultai-demo.fixture.json";
import {
  MetricRow,
  PageHeader,
  PageShell,
  SectionHeading,
} from "@/components/design";

export const metadata = {
  title: "Kurultai demo — knowledge brain API replay",
  description:
    "Replay of real Kurultai daemon API responses — FTS search hits, brain status, and atom registry from a public-docs demo corpus.",
};

interface SearchHit {
  atom: {
    title: string;
    summary: string;
    tags: string[];
    source_id: string;
    trust_lane: string;
  };
  score: number;
  matched_by: string[];
}

export default function KurultaiDemoPage() {
  const { status, searches, atoms } = fixture;
  const hits = (q: string) => (searches as Record<string, SearchHit[]>)[q];

  return (
    <PageShell>
      <PageHeader
        metadata={[
          { content: "Demo / Replay" },
          { content: "kurultai 0.6.0 · FTS-only", className: "hidden sm:inline" },
          { content: "Public-docs corpus" },
        ]}
        title="Kurultai — the knowledge brain, replayed"
        lede={
          <>
            These are real <code>/api/*</code> responses from a Kurultai daemon
            — a Rust + SQLite store with FTS5 search that runs keyless. The
            corpus is public demo notes only; the personal brain is never in
            the demo path.
          </>
        }
      />

      <dl className="demo-metrics" aria-label="Brain status">
        <MetricRow label="Atoms indexed" value={status.atoms} />
        <MetricRow label="Trusted" value={status.brain.trusted_count} />
        <MetricRow label="Quarantined" value={status.brain.quarantine_count} />
        <MetricRow label="Hot tier" value={status.memory.hot} />
      </dl>

      {Object.keys(searches).map((query) => (
        <section
          key={query}
          className="demo-ledger"
          aria-labelledby={`demo-search-${query}`}
        >
          <SectionHeading
            eyebrow={`GET /api/search?q=${query}`}
            title={`Query: “${query}”`}
            description={`${hits(query).length} hit${hits(query).length === 1 ? "" : "s"} — FTS5 bm25 with quality gate; matched_by shows the ranking path.`}
          />
          <div className="demo-hits">
            {hits(query).map((hit) => (
              <article key={hit.atom.source_id} className="demo-hit">
                <header className="demo-hit__head">
                  <span className="demo-hit__title">{hit.atom.title}</span>
                  <span className="demo-hit__meta">
                    {hit.matched_by.join(" + ")} · {hit.score.toFixed(3)}
                  </span>
                </header>
                <p className="demo-hit__summary">
                  {hit.atom.summary.replace(/^#+\s*/gm, "").slice(0, 220)}
                  {hit.atom.summary.length > 220 ? "…" : ""}
                </p>
                <p className="demo-hit__tags">
                  {hit.atom.tags.map((t) => (
                    <span key={t} className="demo-hit__tag">
                      {t}
                    </span>
                  ))}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="demo-ledger" aria-labelledby="demo-atoms-heading">
        <SectionHeading
          eyebrow="GET /api/atoms"
          title="Atom registry"
          description="Every atom carries trust lane, corpus tier, and visibility — quarantined entries stay out of default search."
        />
        <div className="demo-ledger__table" role="table" aria-label="Atom registry">
          <div className="demo-ledger__row demo-ledger__row--atoms demo-ledger__row--head" role="row">
            <span role="columnheader">Atom</span>
            <span role="columnheader">Source</span>
            <span role="columnheader">Trust</span>
          </div>
          {atoms.map(({ atom }) => (
            <div
              key={atom.id}
              className="demo-ledger__row demo-ledger__row--atoms"
              role="row"
            >
              <span className="demo-ledger__model" role="cell">
                {atom.title}
              </span>
              <span role="cell">{atom.source_id}</span>
              <span role="cell">
                <span
                  className={`demo-mark ${
                    atom.trust_lane === "trusted"
                      ? "demo-mark--pass"
                      : "demo-mark--warn"
                  }`}
                >
                  {atom.trust_lane}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <p className="demo-provenance">{fixture.provenance}</p>

      <p>
        <Link href="/demos" className="detail-nav-link">
          ← Demo bay
        </Link>{" "}
        <Link href="/projects/kurultai" className="detail-nav-link">
          Open dossier →
        </Link>
      </p>
    </PageShell>
  );
}
