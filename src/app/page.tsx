import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import {
  sortProjectsByCompleteness,
  resolveOrbitTier,
} from "@/lib/project-completeness";
import { getProjectLabels } from "@/lib/project-labels";
import { Reveal } from "@/components/motion";
import BlackHole from "@/components/BlackHole";

export const revalidate = 3600;

export default async function Home() {
  const all = await getEnrichedProjects();
  const systems = sortProjectsByCompleteness(
    all.filter(
      (p) =>
        resolveOrbitTier({ slug: p.slug, featured: p.featured, orbitTier: p.orbitTier }) !==
          "catalog-only" &&
        (p.tagline ?? "").trim().length > 0
    )
  );
  const featured = systems.slice(0, 6);

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      {/* HERO */}
      <section className="relative min-h-[calc(100dvh-64px)] w-full overflow-hidden bg-background text-foreground flex items-center border-b border-border">
        <div className="absolute right-[-10%] md:right-[-5%] top-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[520px] max-h-[520px] opacity-60 pointer-events-none" aria-hidden="true">
          <BlackHole className="w-full h-full" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <Reveal y={20}>
              <p
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Engineering lead · Agent builder · Systems operator
              </p>
            </Reveal>

            <Reveal y={32} delay={0.05}>
              <h1
                className="mt-4 text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.95] tracking-[-0.03em] font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Luke
                <br />
                Kimball
              </h1>
            </Reveal>

            <Reveal y={24} delay={0.12}>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Systems that compound across AI, trading, OSINT, and production
                infrastructure.
              </p>
            </Reveal>

            <Reveal y={24} delay={0.2}>
              <div
                className="mt-10 flex flex-wrap items-center gap-4"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Link
                  href="/hire"
                  className="inline-flex items-center px-5 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Work together
                </Link>
                <a
                  href="https://github.com/duketopceo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  GitHub ↗
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SELECTED WORK */}
      <section className="py-16 md:py-24 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <p
                  className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Selected work
                </p>
                <h2
                  className="mt-2 text-2xl md:text-3xl tracking-tight font-semibold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Featured systems
                </h2>
              </div>
              <Link
                href="/projects"
                className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                View all →
              </Link>
            </div>
          </Reveal>

          <div className="border-t border-border">
            {featured.map((p, i) => {
              const labels = getProjectLabels(p);
              const rank = String(i + 1).padStart(2, "0");
              return (
                <Reveal key={p.slug} y={24} delay={0.05 * i}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group block border-b border-border py-8 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start gap-4 md:gap-8">
                      <span
                        className="w-8 md:w-12 text-xl md:text-2xl text-muted-foreground font-light tabular-nums"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {rank}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 md:gap-6">
                          <h3
                            className="text-2xl md:text-3xl text-foreground group-hover:text-primary transition-colors font-semibold"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {p.displayName}
                          </h3>

                          <div
                            className="flex items-center gap-3 flex-shrink-0 flex-wrap"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                              {p.category}
                            </span>
                            {labels.map((label) => (
                              <span
                                key={label}
                                className="text-[10px] uppercase tracking-[0.1em] text-primary border border-primary px-1.5 py-0.5"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>

                        <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
                          {p.tagline}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-16 md:py-24 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Reveal>
              <p
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                About
              </p>
              <h2
                className="text-2xl md:text-3xl tracking-tight font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Build systems that last.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-muted-foreground leading-relaxed">
                I ship production platforms and agent tooling across AI, trading,
                OSINT, and cloud infrastructure. Most of the work below is open
                source, running live, or both. If you are hiring for a high-leverage
                technical role, or need a partner for a system that compounds, I am
                open to the right collaboration.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="border border-border p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="max-w-2xl">
                <h2
                  className="text-2xl md:text-3xl tracking-tight font-semibold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Let&apos;s build something that compounds.
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Open to high-leverage collaboration.
                </p>
              </div>
              <Link
                href="/hire"
                className="inline-flex items-center px-5 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Work together →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
