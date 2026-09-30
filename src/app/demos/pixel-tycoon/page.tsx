import Link from "next/link";
import fixture from "@/data/pixel-tycoon-perf.fixture.json";
import {
  MetricRow,
  PageHeader,
  PageShell,
  SectionHeading,
} from "@/components/design";

export const metadata = {
  title: "Pixel Tycoon demo — perf ledger + capture reel",
  description:
    "Godot 4.7 city-block tycoon: real headless perf baseline, regression diff ledger, and a captured day/night/weather reel.",
};

const resolutions = Object.keys(fixture.baseline);
const metricKeys = [
  ["avg_frame_ms", "Avg frame ms"],
  ["scene_load_ms", "Scene load ms"],
  ["static_memory_mb", "Static MB"],
  ["dynamic_memory_mb", "Dynamic MB"],
] as const;

type Row = (typeof fixture.regression.rows)[number];

const cell = (m: Row[keyof Omit<Row, "resolution">]) => (
  <>
    <span
      className={`demo-mark ${m.pass ? "demo-mark--pass" : "demo-mark--fail"}`}
    >
      {m.pass ? "PASS" : "FAIL"}
    </span>{" "}
    {m.before} → {m.after}{" "}
    <span className="demo-ledger__delta">
      ({m.delta > 0 ? "+" : ""}
      {m.pct}%)
    </span>
  </>
);

export default function PixelTycoonDemoPage() {
  const best = fixture.baseline[resolutions[0] as keyof typeof fixture.baseline];

  return (
    <PageShell>
      <PageHeader
        metadata={[
          { content: "Demo / Replay" },
          { content: "pixel-tycoon perf harness", className: "hidden sm:inline" },
          { content: `Captured ${fixture.generatedAt.slice(0, 10)}` },
        ]}
        title="Pixel Tycoon — measured, not vibes"
        lede={
          <>
            A Godot 4.7 city-block tycoon instrumented like a service: a
            headless benchmark writes per-resolution frame cost, memory, and
            scene-load baselines, and every change runs against a regression
            diff with explicit pass thresholds. The reel below is real
            gameplay output — day/night cycle, weather states, districts, and
            the phone-menu UI.
          </>
        }
      />

      <dl className="demo-metrics" aria-label="Run summary">
        <MetricRow label="Resolutions benched" value={resolutions.length} />
        <MetricRow label="Peak FPS" value={best.fps} />
        <MetricRow label="Avg frame" value={`${best.avg_frame_ms} ms`} />
        <MetricRow
          label="Regression gate"
          value={fixture.regression.pass ? "PASS" : "FAIL"}
        />
      </dl>

      <section className="demo-ledger" aria-labelledby="demo-perf-heading">
        <SectionHeading
          eyebrow="Fig. 01 — Baseline"
          title="Per-resolution perf baseline"
          description="Headless capture at the two viewports the project benchmarks — the 720p design canvas and the native ultrawide."
        />
        <div className="demo-ledger__table" role="table" aria-label="Perf baseline">
          <div className="demo-ledger__row demo-ledger__row--perf demo-ledger__row--head" role="row">
            <span role="columnheader">Resolution</span>
            <span role="columnheader">FPS</span>
            <span role="columnheader">Frame ms</span>
            <span role="columnheader">Load ms</span>
            <span role="columnheader">Static MB</span>
            <span role="columnheader">Dynamic MB</span>
          </div>
          {resolutions.map((res) => {
            const b = fixture.baseline[res as keyof typeof fixture.baseline];
            return (
              <div key={res} className="demo-ledger__row demo-ledger__row--perf" role="row">
                <span className="demo-ledger__model" role="cell">{res}</span>
                <span role="cell">{b.fps}</span>
                <span role="cell">{b.avg_frame_ms}</span>
                <span role="cell">{b.scene_load_ms}</span>
                <span role="cell">{b.static_memory_mb}</span>
                <span role="cell">{b.dynamic_memory_mb}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="demo-ledger" aria-labelledby="demo-regression-heading">
        <SectionHeading
          eyebrow="Fig. 02 — Regression gate"
          title="Before vs after, per metric"
          description="The harness fails the run when a metric drifts past its threshold — frame time ±1ms, load ±50ms, memory +10/50MB. This run is all green: frame time and memory both improved ~9%."
        />
        <div className="demo-ledger__table" role="table" aria-label="Regression diff">
          <div className="demo-ledger__row demo-ledger__row--reg demo-ledger__row--head" role="row">
            <span role="columnheader">Resolution</span>
            {metricKeys.map(([key, label]) => (
              <span key={key} role="columnheader">{label}</span>
            ))}
          </div>
          {fixture.regression.rows.map((row) => (
            <div key={row.resolution} className="demo-ledger__row demo-ledger__row--reg" role="row">
              <span className="demo-ledger__model" role="cell">{row.resolution}</span>
              <span role="cell">{cell(row.avg_frame_ms)}</span>
              <span role="cell">{cell(row.scene_load_ms)}</span>
              <span role="cell">{cell(row.static_memory_mb)}</span>
              <span role="cell">{cell(row.dynamic_memory_mb)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="demo-gallery" aria-labelledby="demo-reel-heading">
        <SectionHeading
          eyebrow="Fig. 03 — Capture reel"
          title="Real output, real states"
          description="Day/night cycle, four weather states, three districts, occlusion pass, and the phone/inventory UI — all captured in-engine."
        />
        <div className="demo-gallery__grid">
          {fixture.captures.map((c) => (
            <figure key={c.src} className="demo-gallery__item">
              <img
                src={`/demos/pixel-tycoon/${c.src}`}
                alt={c.label}
                loading="lazy"
              />
              <figcaption>{c.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <p className="demo-provenance">{fixture.provenance}</p>

      <p>
        <Link href="/demos" className="detail-nav-link">
          ← Demo bay
        </Link>{" "}
        <Link href="/projects/pixel-tycoon" className="detail-nav-link">
          Open dossier →
        </Link>
      </p>
    </PageShell>
  );
}
