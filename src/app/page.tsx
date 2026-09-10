import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import {
  sortProjectsByCompleteness,
  resolveOrbitTier,
  scoreProjectCompleteness,
} from "@/lib/project-completeness";
import { isProjectLive } from "@/lib/deployments";
import { Reveal } from "@/components/motion";

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
  const dropped = all.length - systems.length;
  const top = systems.slice(0, 10);
  const rest = systems.slice(10);

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      {/* HERO */}
      <section className="relative min-h-[50dvh] flex flex-col justify-end bg-background text-foreground border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-3xl">
            <Reveal y={20}>
              <p
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Luke Kimball — Engineering Portfolio
              </p>
            </Reveal>

            <Reveal y={32} delay={0.05}>
              <h1
                className="mt-4 text-[clamp(3rem,10vw,7.5rem)] leading-[0.95] tracking-[-0.03em] font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Cosmic
                <br />
                Intelligence
              </h1>
            </Reveal>

            <Reveal y={24} delay={0.12}>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Top {top.length} systems showcased. {rest.length} more catalogued
                by signal. {dropped} omitted.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TOP 10 SHOWCASE */}
      <section className="py-16 md:py-24 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p
              className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Top 10 · Quality
            </p>
          </Reveal>

          <div className="space-y-16">
            {top.map((p, i) => {
              const score = scoreProjectCompleteness(p);
              const rank = String(i + 1).padStart(2, "0");
              const tech = (p.techStack ?? []).slice(0, 4);
              return (
                <Reveal key={p.slug} y={24} delay={0.05}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group block"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                      <div className="md:col-span-1">
                        <span
                          className="text-3xl md:text-4xl text-muted-foreground font-light tabular-nums"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {rank}
                        </span>
                      </div>

                      <div className="md:col-span-11">
                        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                          <h3
                            className="text-3xl md:text-4xl text-foreground group-hover:text-primary transition-colors font-semibold"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {p.displayName}
                          </h3>

                          <div
                            className="flex items-center gap-4 flex-shrink-0"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                              {p.category}
                            </span>
                            {isProjectLive(p) && (
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-primary uppercase tracking-[0.1em]">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                                Live
                              </span>
                            )}
                            <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground tabular-nums">
                              {score}
                            </span>
                          </div>
                        </div>

                        <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-4xl">
                          {p.tagline}
                        </p>

                        {tech.length > 0 && (
                          <div
                            className="mt-4 flex flex-wrap gap-2"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {tech.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground border border-border px-2 py-1"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* QUANTITY LIST */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="border-b border-border pb-4 mb-6 flex items-center justify-between">
              <p
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Quantity · {rest.length} systems
              </p>
              <p
                className="hidden md:block text-xs uppercase tracking-[0.25em] text-muted-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Category · Signal
              </p>
            </div>
          </Reveal>

          <div className="border-t border-border">
            {rest.map((p, i) => {
              const score = scoreProjectCompleteness(p);
              const rank = String(i + 11).padStart(2, "0");
              return (
                <Reveal key={p.slug} y={16} delay={0.02 * i}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group block border-b border-border py-5 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start gap-4 md:gap-8">
                      <span
                        className="w-8 md:w-12 text-sm text-muted-foreground font-light tabular-nums"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {rank}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 md:gap-6">
                          <h3
                            className="text-lg md:text-xl text-foreground group-hover:text-primary transition-colors font-medium"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {p.displayName}
                          </h3>

                          <div
                            className="flex items-center gap-4 flex-shrink-0"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                              {p.category}
                            </span>
                            {isProjectLive(p) && (
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-primary uppercase tracking-[0.1em]">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                                Live
                              </span>
                            )}
                            <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground tabular-nums">
                              {score}
                            </span>
                          </div>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-4xl line-clamp-2">
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

      {/* ABOUT CTA */}
      <section className="py-24 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="border border-border p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="max-w-2xl">
                <h2
                  className="text-2xl md:text-3xl tracking-tight font-semibold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Engineering lead, agent builder, systems operator.
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Open to high-leverage collaboration.
                </p>
              </div>
              <Link
                href="/hire"
                className="inline-flex items-center px-5 py-2.5 text-xs font-semibold tracking-[0.15em] uppercase border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
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
