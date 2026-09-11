import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import {
  sortProjectsByCompleteness,
  resolveOrbitTier,
} from "@/lib/project-completeness";
import { getProjectLabels } from "@/lib/project-labels";
import { Reveal } from "@/components/motion";

export const revalidate = 3600;

export const metadata = {
  title: "Projects — Catalog",
  description:
    "Browse all systems: AI, trading, OSINT, infrastructure, and web.",
};

export default async function ProjectsPage() {
  const all = await getEnrichedProjects();
  const systems = sortProjectsByCompleteness(
    all.filter(
      (p) =>
        resolveOrbitTier({ slug: p.slug, featured: p.featured, orbitTier: p.orbitTier }) !==
          "catalog-only" &&
        (p.tagline ?? "").trim().length > 0
    )
  );

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <section className="min-h-[40dvh] flex flex-col justify-end bg-background text-foreground border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <Reveal y={20}>
            <p
              className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Catalog
            </p>
          </Reveal>

          <Reveal y={32} delay={0.05}>
            <h1
              className="mt-4 text-[clamp(3rem,10vw,6rem)] leading-[0.95] tracking-[-0.03em] font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              All systems
            </h1>
          </Reveal>

          <Reveal y={24} delay={0.12}>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              {systems.length} repositories, ranked by signal.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="border-b border-border pb-4 mb-6 flex items-center justify-between">
              <p
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                System
              </p>
              <p
                className="hidden md:block text-xs uppercase tracking-[0.25em] text-muted-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Domain · Status
              </p>
            </div>
          </Reveal>

          <div className="border-t border-border">
            {systems.map((p, i) => {
              const labels = getProjectLabels(p);
              const rank = String(i + 1).padStart(2, "0");
              return (
                <Reveal key={p.slug} y={16}>
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
    </div>
  );
}
