import Link from "next/link";
import fixture from "@/data/argus-eval.fixture.json";
import {
  MetricRow,
  PageHeader,
  PageShell,
  SectionHeading,
} from "@/components/design";

export const metadata = {
  title: "Argus demo — cost-metered vision E2E",
  description:
    "Replay of a real Argus eval bake-off: per-model cold and warm runs with vision-call counts and dollar cost ledger.",
};

const usd = (n: number | null) => (n == null ? "—" : `$${n.toFixed(4)}`);

export default function ArgusDemoPage() {
  const results = fixture.results;

  return (
    <PageShell>
      <PageHeader
        metadata={[
          { content: "Demo / Replay" },
          { content: "argus-reviewer-e2e", className: "hidden sm:inline" },
          { content: `Captured ${fixture.generatedAt.slice(0, 10)}` },
        ]}
        title="Argus — cost-explicit vision E2E"
        lede={
          <>
            A real eval run from the Argus harness: two models over the same
            three-test suite, once cold (every step hits the vision model) and
            once warm (fingerprint cache). The ledger is the product — every
            vision call is priced, so a regression suite can carry a dollar
            figure on the PR.
          </>
        }
      />

      <dl className="demo-metrics" aria-label="Run summary">
        <MetricRow label="Budget cap" value={usd(fixture.budgetUsd)} />
        <MetricRow label="Models under test" value={results.length} />
        <MetricRow
          label="Cheapest cold run"
          value={usd(
            Math.min(...results.map((r) => r.cold.visionCostUsd ?? Infinity)),
          )}
        />
        <MetricRow
          label="Warm replays at $0"
          value={`${results.filter((r) => r.warm.visionCalls === 0).length}/${results.length}`}
        />
      </dl>

      <section className="demo-ledger" aria-labelledby="demo-ledger-heading">
        <SectionHeading
          eyebrow="Fig. 01 — Cost ledger"
          title="Cold vs warm, per model"
          description="Cold runs pay for every step the model sees. Warm runs replay the fingerprint cache — vision spend only where the UI drifted."
        />
        <div className="demo-ledger__table" role="table" aria-label="Model cost ledger">
          <div className="demo-ledger__row demo-ledger__row--head" role="row">
            <span role="columnheader">Model</span>
            <span role="columnheader">Cold</span>
            <span role="columnheader">Cold calls</span>
            <span role="columnheader">Cold cost</span>
            <span role="columnheader">Warm calls</span>
            <span role="columnheader">Warm cost</span>
          </div>
          {results.map((r) => (
            <div key={r.model} className="demo-ledger__row" role="row">
              <span className="demo-ledger__model" role="cell">
                {r.model.split("/")[1]}
              </span>
              <span role="cell">
                {r.cold.ok ? (
                  <span className="demo-mark demo-mark--pass">PASS</span>
                ) : (
                  <span className="demo-mark demo-mark--fail">
                    {r.cold.passed}/{r.cold.tests}
                  </span>
                )}
              </span>
              <span role="cell">{r.cold.visionCalls}</span>
              <span role="cell">{usd(r.cold.visionCostUsd)}</span>
              <span role="cell">{r.warm.visionCalls}</span>
              <span role="cell">{usd(r.warm.visionCostUsd)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="demo-ledger" aria-labelledby="demo-findings-heading">
        <SectionHeading
          eyebrow="Fig. 02 — What the run caught"
          title="Failures are evidence, not noise"
          description="The losing model's failure is captured verbatim — a grounding miss the cache diff would have flagged for review."
        />
        {results
          .flatMap((r) =>
            r.cold.failures.map((f) => ({ model: r.model, ...f })),
          )
          .map((f) => (
            <div key={f.name} className="demo-finding">
              <span className="demo-finding__badge">FAIL</span>
              <div>
                <p className="demo-finding__name">{f.name}</p>
                <p className="demo-finding__reason">{f.reason}</p>
                <p className="demo-finding__model">{f.model}</p>
              </div>
            </div>
          ))}
      </section>

      <p className="demo-provenance">{fixture.provenance}</p>

      <p>
        <Link href="/demos" className="detail-nav-link">
          ← Demo bay
        </Link>{" "}
        <Link href="/projects/argus" className="detail-nav-link">
          Open dossier →
        </Link>
      </p>
    </PageShell>
  );
}
