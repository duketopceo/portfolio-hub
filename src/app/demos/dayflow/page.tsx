import Link from "next/link";
import {
  MetricRow,
  PageHeader,
  PageShell,
  SectionHeading,
} from "@/components/design";
import { MediaFrame } from "@/components/design";

export const metadata = {
  title: "Dayflow demo — desktop timeline widget",
  description:
    "Replay of the real Dayflow QML surface — a privacy-first activity timeline with 15-minute blocks, app tagging, and on-device summarization.",
};

const entries = [
  {
    range: "4:45 PM – 5:00 PM",
    span: "15m",
    tag: "Idle",
    app: "Agent Zero",
    title: "System locked and idle",
    detail:
      "The system was sitting at the lock screen for the duration of the capture. No active user interaction was detected.",
  },
  {
    range: "4:30 PM – 4:45 PM",
    span: "15m",
    tag: "Idle",
    app: null,
    title: "No activity",
    detail: "Screen was off or idle.",
  },
  {
    range: "4:15 PM – 4:30 PM",
    span: "15m",
    tag: "Coding",
    app: "Agent Zero",
    title: "Developing Game Dev Bit game with Agent Zero",
    detail:
      "You were using the Agent Zero AI platform to automate the development of a Game Dev Bit-style game.",
  },
];

export default function DayflowDemoPage() {
  return (
    <PageShell>
      <PageHeader
        metadata={[
          { content: "Demo / Replay" },
          { content: "dayflow-linux · QML", className: "hidden sm:inline" },
          { content: "Real capture" },
        ]}
        title="Dayflow — the day, reconstructed"
        lede={
          <>
            A real capture from the Dayflow desktop widget — a Go daemon +
            QML panel that samples a frame every 10 seconds, dedupes
            unchanged shots, and every 15 minutes asks a vision model to
            write a plain-language block. The screenshot below is the
            shipping UI; the timeline is reconstructed in the registry&apos;s
            grammar so the data reads on any screen.
          </>
        }
      />

      <section className="demo-ledger" aria-labelledby="dayflow-capture">
        <SectionHeading
          eyebrow="CAPTURE — preview.png"
          title="The QML surface, as shipped"
          description="Today tab: scrollable timeline, Expand/Pause controls, Standup · Chat · Week · Settings views."
        />
        <MediaFrame>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dayflow-preview.png"
            alt="Dayflow widget showing the Today timeline with 15-minute activity blocks tagged Idle and Coding"
            className="demo-shot"
          />
        </MediaFrame>
      </section>

      <section className="demo-ledger" aria-labelledby="dayflow-timeline">
        <SectionHeading
          eyebrow="TIMELINE — reconstructed"
          title="The same blocks, in registry grammar"
          description="Each block carries a time range, span, tag, and a model-written summary — frames and the SQLite store stay local under ~/.local/share/dayflow."
        />
        <div className="demo-hits">
          {entries.map((e) => (
            <article key={e.range} className="demo-hit">
              <header className="demo-hit__head">
                <span className="demo-hit__title">
                  {e.range} · {e.span}
                </span>
                <span className="demo-hit__meta">
                  {e.app ? `${e.app} · ` : ""}
                  {e.tag}
                </span>
              </header>
              <p className="demo-hit__summary">
                <strong>{e.title}.</strong> {e.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      <dl className="demo-metrics" aria-label="Capture footer">
        <MetricRow label="Frames recorded" value={95} />
        <MetricRow label="Pending summaries" value={1} />
        <MetricRow label="Local store" value="35.5 MB" />
      </dl>

      <p className="demo-provenance">
        Screenshot and timeline transcribed from the real dayflow-linux
        capture (<code>preview.png</code>) — a QML desktop app, not a web
        mock.
      </p>

      <p>
        <Link href="/demos" className="detail-nav-link">
          ← Demo bay
        </Link>{" "}
        <Link href="/projects/dayflow-linux" className="detail-nav-link">
          Open dossier →
        </Link>
      </p>
    </PageShell>
  );
}
