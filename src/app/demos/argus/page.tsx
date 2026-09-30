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
          description="Cold-run failures are captured verbatim — grounding misses the cache diff would flag for review. This run came back clean."
        />
        {results.every((r) => r.cold.failures.length === 0) ? (
          <div className="demo-finding demo-finding--clean">
            <span className="demo-finding__badge demo-finding__badge--pass">
              PASS
            </span>
            <div>
              <p className="demo-finding__name">Clean sweep — 3/3 both models</p>
              <p className="demo-finding__reason">
                No grounding misses this run. Prior captures include a kimi-k2.5
                grounding miss on the name field — the ledger keeps it honest.
              </p>
            </div>
          </div>
        ) : (
          results
            .flatMap((r) =>
              r.cold.failures.map(
                (f: { name: string; reason: string }) => ({
                  model: r.model,
                  ...f,
                }),
              ),
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
            ))
        )}
      </section>

      <section className="demo-ledger" aria-labelledby="demo-shipped-heading">
        <SectionHeading
          eyebrow="Fig. 03 — Since the capture"
          title="The eval harness became a shipped reviewer"
          description="The fixture above is where it started. Since then Argus released 0.3.x — a formal GitHub review surface that can satisfy required-review gates."
        />
        <div className="demo-ledger__table" role="table" aria-label="Shipped since capture">
          <div className="demo-ledger__row demo-ledger__row--atoms demo-ledger__row--head" role="row">
            <span role="columnheader">Shipped</span>
            <span role="columnheader">What it does</span>
            <span role="columnheader">Ref</span>
          </div>
          <div className="demo-ledger__row demo-ledger__row--atoms" role="row">
            <span className="demo-ledger__model" role="cell">v0.3.0 — Review surface</span>
            <span role="cell">CodeRabbit-style suggestion blocks with gated REQUEST_CHANGES</span>
            <span role="cell">#92</span>
          </div>
          <div className="demo-ledger__row demo-ledger__row--atoms" role="row">
            <span className="demo-ledger__model" role="cell">Formal GitHub reviews</span>
            <span role="cell">Submits a real review — an Argus verdict can satisfy required-approvals branch protection</span>
            <span role="cell">#91</span>
          </div>
          <div className="demo-ledger__row demo-ledger__row--atoms" role="row">
            <span className="demo-ledger__model" role="cell">Review-depth tranche</span>
            <span role="cell">Prompt packs, explore captures, @argus commands, probe persistence</span>
            <span role="cell">#97</span>
          </div>
          <div className="demo-ledger__row demo-ledger__row--atoms" role="row">
            <span className="demo-ledger__model" role="cell">Budget ledger fix</span>
            <span role="cell">Integer-cent accounting — float drift could trip the USD cap falsely</span>
            <span role="cell">#89</span>
          </div>
          <div className="demo-ledger__row demo-ledger__row--atoms" role="row">
            <span className="demo-ledger__model" role="cell">v0.3.1 — Model override</span>
            <span role="cell">ARGUS_CODE_MODEL env override for the review model</span>
            <span role="cell">#96</span>
          </div>
        </div>
      </section>

      <section className="demo-gallery" aria-labelledby="demo-surface-heading">
        <SectionHeading
          eyebrow="Fig. 04 — Review surface"
          title="A real review, captured"
          description="Argus reviewing a live PR — conversation verdict and per-file suggestion blocks."
        />
        <div className="demo-gallery__grid">
          <figure className="demo-gallery__item">
            <img
              src="/demos/argus/pr31-conversation.png"
              alt="Argus PR review — conversation verdict"
              loading="lazy"
            />
            <figcaption>PR review — verdict</figcaption>
          </figure>
          <figure className="demo-gallery__item">
            <img
              src="/demos/argus/pr31-files.png"
              alt="Argus PR review — per-file suggestions"
              loading="lazy"
            />
            <figcaption>PR review — per-file suggestions</figcaption>
          </figure>
        </div>
      </section>

      <p className="demo-provenance">{fixture.provenance} Review-surface captures from Argus demo/pr31-review-surface (2026-09-29); shipped ledger from git history through v0.3.1.</p>

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
