"use client";

/**
 * BDH (Dragon Hatchling) research dossier.
 *
 * Honest framing: BDH is a post-transformer research architecture by Pathway —
 * no runnable API / weights on OpenRouter yet. This card is a research dossier,
 * not a benchmark. It shows the eval craft: how you'd gate a new architecture
 * when/if it lands on OpenRouter. No fabricated numbers.
 */

const BDH = {
  name: "BDH — Dragon Hatchling",
  vendor: "Pathway",
  type: "Post-transformer architecture",
  paper: "arxiv.org/abs/2509.26507",
  explainer: "pathway.com/research/bdh-explainer",
  date: "Aug 2026",
  claims: [
    "Memory, adaptation, and inference in one computational fabric — no external memory bolted on.",
    "Attention emerges from local, graph-based neuron interactions (scale-free biological network), not centralized matrix multiplication.",
    "Dual GPU-friendly implementation that claims to match GPT-style Transformer performance.",
    "Mechanistic interpretability of attention emerges from the architecture itself, not post-hoc analysis.",
    "Aimed at continual learning, persistent state, and generalization over time — the gap in dense Transformers.",
  ],
  // Honest readiness — not on OpenRouter, not runnable.
  readiness: "Research / preview — no public weights or API on OpenRouter as of Aug 2026.",
  // The eval criteria you'd apply if it landed — this is the craft.
  gatingPlaybook: [
    "Smoke: cURL against Chat Completions-compatible endpoint, verify TTFT / shape.",
    "Fixture eval: run the 5-task coding set (reverse-string, fizzbuzz, two-sum, palindrome, factorial) — same task names as the portfolio baked snapshot in src/data/bakeoff.json.",
    "Compare: latency, cost, and code-quality vs the dense ~30B class (Qwen 3.8-27b, Muse Glimmer 30B, Gemma 4 31B).",
    "Memory/reasoning probe: test whether continual-learning claims hold beyond a single turn.",
    "Gate: pass/fail on latency + cost + quality thresholds before any launch note.",
  ],
};

export default function BdhDossier() {
  return (
    <section className="openrouter-section openrouter-section--bdh openrouter-section--secondary">
      <p className="openrouter-section__eyebrow">Also on my radar</p>
      <div className="bdh-head">
        <div>
          <h2>{BDH.name}</h2>
          <p className="bdh-sub">
            {BDH.type} · {BDH.vendor} · {BDH.date}
          </p>
        </div>
        <span className="openrouter-card__badge">Research preview</span>
      </div>

      <p className="openrouter-card__summary" style={{ marginTop: "0.5rem" }}>
        Biological neural network research from Pathway — interesting
        post-transformer architecture worth tracking. Not runnable on
        OpenRouter yet; this is an honest{" "}
        <em>launch-gate evaluation playbook</em>, not a benchmark or live score.
      </p>

      <div className="openrouter-card__meta" style={{ marginTop: "1rem" }}>
        <div>
          <dt>Claims (from the paper)</dt>
          <dd>
            <ul className="bdh-list">
              {BDH.claims.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Readiness</dt>
          <dd style={{ color: "var(--color-text-faint)" }}>{BDH.readiness}</dd>
        </div>
        <div>
          <dt>How I&apos;d gate it if it landed</dt>
          <dd>
            <ol className="bdh-list">
              {BDH.gatingPlaybook.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </dd>
        </div>
      </div>

      <footer className="openrouter-card__footer" style={{ marginTop: "1rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
          {BDH.paper} · {BDH.explainer}
        </span>
      </footer>
    </section>
  );
}
