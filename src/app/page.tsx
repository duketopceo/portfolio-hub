import { getFeaturedProjects, getEnrichedProjects } from "@/lib/github";
import ProjectCard from "@/components/ProjectCard";
import { categoryMeta } from "@/data/projects";
import Link from "next/link";

export const revalidate = 3600;

export default async function Home() {
  const [featured, all] = await Promise.all([
    getFeaturedProjects(),
    getEnrichedProjects(),
  ]);

  const categoryCounts = all.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const languages = new Set(all.map((p) => p.language).filter(Boolean));
  const liveCount = all.filter((p) => p.liveUrl).length;

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 sm:px-6 pt-20 sm:pt-28 pb-16">
        <div className="max-w-xl">
          {/* Status badge */}
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md mb-5 animate-fade-up"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-faint)",
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--color-live)" }}
            />
            {all.length} projects &middot; {languages.size} languages
          </div>

          <h1
            className="mb-4 animate-fade-up"
            style={{ animationDelay: "60ms", lineHeight: 1.15 }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-2xl)",
                fontWeight: 400,
                color: "var(--color-text-muted)",
                display: "block",
                letterSpacing: "-0.01em",
              }}
            >
              Building systems
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-2xl)",
                fontWeight: 700,
                color: "var(--color-accent)",
                letterSpacing: "-0.02em",
              }}
            >
              that compound.
            </span>
          </h1>

          <p
            className="mb-8 animate-fade-up"
            style={{
              fontSize: "var(--text-sm)",
              lineHeight: 1.6,
              color: "var(--color-text-muted)",
              maxWidth: "480px",
              animationDelay: "120ms",
            }}
          >
            Full-stack engineer building AI-powered automation, trading
            systems, OSINT platforms, and the infrastructure to run them
            — from Docker Swarm clusters to production deployments.
          </p>

          <div
            className="flex flex-wrap gap-2 animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors duration-150"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text)",
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                textDecoration: "none",
              }}
            >
              View all projects
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 20 20"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M4 10h12M12 6l4 4-4 4" />
              </svg>
            </Link>
            <Link
              href="/now"
              className="inline-flex items-center px-4 py-2 rounded-md transition-colors duration-150"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
                textDecoration: "none",
              }}
            >
              Recent activity
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category chips — horizontal scrollable strip ─── */}
      <section className="mx-auto max-w-5xl px-5 sm:px-6 pb-10">
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryMeta).map(([key, meta], i) => (
            <Link
              key={key}
              href={`/projects?category=${key}`}
              className="glass inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 animate-fade-up"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                animationDelay: `${i * 40}ms`,
              }}
            >
              {meta.label}
              <span style={{ color: "var(--color-accent)" }}>
                {categoryCounts[key] || 0}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Projects ─────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              color: "var(--color-text-faint)",
            }}
          >
            Featured
          </h2>
          <Link
            href="/projects"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-faint)",
              textDecoration: "none",
            }}
          >
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {featured.map((project, i) => (
            <div
              key={project.slug}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ProjectCard project={project} featured />
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats — single row of 4 glass metric blocks ── */}
      <section className="mx-auto max-w-5xl px-5 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Projects", value: all.length },
            { label: "Languages", value: languages.size },
            { label: "Live", value: liveCount },
            { label: "Categories", value: Object.keys(categoryCounts).length },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="glass-card p-4 text-center animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className="tabular-nums mb-0.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-faint)",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
