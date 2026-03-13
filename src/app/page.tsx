import { getEnrichedProjects } from "@/lib/github";
import QuadrantGraph from "@/components/QuadrantGraph";

export const revalidate = 3600;

export default async function Home() {
  const all = await getEnrichedProjects();
  const liveCount = all.filter((p) => p.liveUrl || p.demoUrl).length;
  const categories = new Set(all.map((p) => p.category));

  return (
    <div>
      {/* ── Hero — compact tagline + stats ──────── */}
      <section
        className="mx-auto max-w-5xl px-5 sm:px-6 text-center"
        style={{ paddingTop: "1rem", paddingBottom: "0.5rem" }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
            fontWeight: 700,
            color: "var(--color-text)",
            lineHeight: 1.2,
            marginBottom: "0.35rem",
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
          }}
        >
          {all.length} projects &middot; {categories.size} categories &middot;{" "}
          {liveCount} live demos
        </p>
      </section>

      {/* ── Quadrant Graph ───────────────────────── */}
      <section style={{ paddingBottom: "clamp(1rem, 2vw, 1.5rem)" }}>
        <QuadrantGraph projects={all} />
      </section>
    </div>
  );
}
