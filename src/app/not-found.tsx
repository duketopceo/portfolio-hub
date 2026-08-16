import Link from "next/link";

/** Deterministic pseudo-random positions for the starfield. */
const stars = Array.from({ length: 40 }, (_, i) => {
  // Simple hash-like spread using golden ratio
  const g = 0.618033988749895;
  const left = ((i * g * 100) % 100).toFixed(1);
  const top = ((i * g * 61.8 + i * 7.3) % 100).toFixed(1);
  const delay = ((i * g * 3) % 3).toFixed(2);
  const duration = (2 + ((i * g * 3) % 3)).toFixed(2);
  return { left, top, delay, duration };
});

export default function NotFound() {
  return (
    <div className="cosmic-page cosmic-page--shell min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden">
      {/* Starfield background */}
      <div className="not-found-stars" aria-hidden="true">
        {stars.map((s, i) => (
          <span
            key={i}
            className="not-found-star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              "--star-delay": `${s.delay}s`,
              "--star-dur": `${s.duration}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="relative z-10">
        <p
          className="text-[8rem] font-bold leading-none"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-accent)",
            opacity: 0.15,
          }}
        >
          404
        </p>
        <h1
          className="text-2xl font-semibold -mt-6"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text)",
          }}
        >
          Lost in the Cosmos
        </h1>
        <p
          className="text-sm mt-2 max-w-md"
          style={{ color: "var(--color-text-muted)" }}
        >
          This page drifted out of orbit.
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
        <Link href="/hire" className="detail-cta">
          Hire Luke
        </Link>
        <Link href="/projects" className="detail-nav-link">
          Back to Projects
        </Link>
      </div>
    </div>
  );
}
