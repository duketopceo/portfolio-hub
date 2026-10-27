import type { ReactNode } from "react";
import { PageShell, SectionHeading } from "@/components/design";
import { ArgusDemo } from "./ArgusDemo";
import { DayflowDemo } from "./DayflowDemo";
import { KurultaiDemo } from "./KurultaiDemo";
import { OpenRouterEvidence } from "./OpenRouterEvidence";

interface DemoEntry {
  eyebrow: string;
  title: string;
  lede: ReactNode;
  body: ReactNode;
}

/** Demo content keyed by project slug. Each renders inside `#demo` on its dossier. */
const demos: Record<string, DemoEntry> = {
  argus: {
    eyebrow: "Demo / Replay · argus-reviewer-e2e",
    title: "Argus — cost-explicit vision E2E",
    lede: (
      <>
        A real eval run from the Argus harness: two models over the same
        three-test suite, once cold (every step hits the vision model) and once
        warm (fingerprint cache). The ledger is the product — every vision call
        is priced, so a regression suite can carry a dollar figure on the PR.
      </>
    ),
    body: <ArgusDemo />,
  },
  kurultai: {
    eyebrow: "Demo / Replay · kurultai 0.6.0 · FTS-only",
    title: "Kurultai — the knowledge brain, replayed",
    lede: (
      <>
        These are real <code>/api/*</code> responses from a Kurultai daemon — a
        Rust + SQLite store with FTS5 search that runs keyless. The corpus is
        public demo notes only; the personal brain is never in the demo path.
      </>
    ),
    body: <KurultaiDemo />,
  },
  "dayflow-linux": {
    eyebrow: "Demo / Replay · dayflow-linux · QML",
    title: "Dayflow — the day, reconstructed",
    lede: (
      <>
        A real capture from the Dayflow desktop widget — a Go daemon + QML panel
        that samples a frame every 10 seconds, dedupes unchanged shots, and
        every 15 minutes asks a vision model to write a plain-language block.
        The screenshot below is the shipping UI; the timeline is reconstructed
        in the registry&apos;s grammar so the data reads on any screen.
      </>
    ),
    body: <DayflowDemo />,
  },
  openrouter: {
    eyebrow: "Demo / OpenRouter harness",
    title: "Application demos and evidence",
    lede: (
      <>
        A portfolio viewer for four eval-driven demos mapped to OpenRouter
        application roles — fixture summaries, a baked coding comparison, and an
        optional live smoke test.
      </>
    ),
    body: <OpenRouterEvidence />,
  },
};

export function hasDossierDemo(slug: string): boolean {
  return slug in demos;
}

export function DossierDemoSection({ slug }: { slug: string }) {
  const demo = demos[slug];
  if (!demo) return null;
  return (
    <PageShell className="dossier-page__demo-section">
      <section id="demo" aria-labelledby="demo-heading" className="dossier-demo">
        <SectionHeading
          eyebrow={demo.eyebrow}
          title={<span id="demo-heading">{demo.title}</span>}
          description={demo.lede}
        />
        {demo.body}
      </section>
    </PageShell>
  );
}
