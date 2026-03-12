import { getFeaturedProjects, getEnrichedProjects } from "@/lib/github";
import ProjectCard from "@/components/ProjectCard";
import { categoryMeta } from "@/data/projects";
import Link from "next/link";

export const revalidate = 3600; // ISR: revalidate every hour

export default async function Home() {
  const [featured, all] = await Promise.all([
    getFeaturedProjects(),
    getEnrichedProjects(),
  ]);

  // Category stats
  const categoryCounts = all.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-zinc-50 dark:from-teal-950/20 dark:via-zinc-950 dark:to-zinc-950" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-700 dark:text-teal-400 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {all.length} projects
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              Building systems
              <br />
              <span className="text-teal-600 dark:text-teal-400">
                that compound.
              </span>
            </h1>

            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl">
              Entrepreneur and developer in Utah. I build AI-powered automation,
              trading systems, OSINT platforms, and the infrastructure to run
              them — from Docker Swarm clusters to production deployments.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                View all projects
                <svg
                  className="w-4 h-4 ml-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/now"
                className="inline-flex items-center px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg transition-colors"
              >
                What I&apos;m working on
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Overview ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <Link
              key={key}
              href={`/projects?category=${key}`}
              className="group flex flex-col items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700 bg-white dark:bg-zinc-900 transition-all hover:shadow-sm"
            >
              <span className="text-2xl mb-2">{meta.icon}</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 text-center">
                {meta.label}
              </span>
              <span className="text-xs text-zinc-500 mt-0.5">
                {categoryCounts[key] || 0} projects
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Projects ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Featured Projects
          </h2>
          <Link
            href="/projects"
            className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
          >
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              featured
            />
          ))}
        </div>
      </section>

      {/* ── Quick Stats ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Projects", value: all.length },
            {
              label: "Languages",
              value: new Set(
                all.map((p) => p.language).filter(Boolean)
              ).size,
            },
            {
              label: "Live Deployments",
              value: all.filter((p) => p.liveUrl).length,
            },
            {
              label: "Categories",
              value: Object.keys(categoryCounts).length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center"
            >
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
