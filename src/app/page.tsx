import { getEnrichedProjects } from "@/lib/github";
import QuadrantGraph from "@/components/QuadrantGraph";

export const revalidate = 3600;

export default async function Home() {
  const all = await getEnrichedProjects();
  const liveCount = all.filter((p) => p.liveUrl || p.demoUrl).length;

  return (
    <div>
      {/* ── Hero — tight, centered, purposeful ──────── */}
      <section className="mx-auto max-w-5xl px-5 sm:px-6 pt-14 sm:pt-20 pb-6 sm:pb-8 text-center">
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: 700,
            color: "var(--color-text)",
            lineHeight: 1.2,
            marginBottom: "0.75rem",
          }}
        >
          Systems that{" "}
          <span style={{ color: "var(--color-accent)" }}>compound.</span>
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.04em",
            color: "var(--color-text-faint)",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          {all.length} projects across AI, finance, OSINT, infrastructure
          & full-stack — {liveCount} with live demos.
          Mapped by scope and domain below.
        </p>
      </section>

      {/* ── Quadrant Graph ───────────────────────────── */}
      <section className="pb-16 sm:pb-24">
        <QuadrantGraph projects={all} />
      </section>
    </div>
  );
}
