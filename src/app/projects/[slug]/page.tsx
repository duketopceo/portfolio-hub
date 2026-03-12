import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProjectBySlug,
  getAllSlugs,
  fetchReadme,
} from "@/lib/github";
import { formatDate, languageColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import {
  LockIcon,
  ExternalIcon,
  ChevronIcon,
  CheckIcon,
} from "@/components/Icons";
import DemoEmbed from "@/components/DemoEmbed";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.displayName} — Engineering Portfolio`,
    description: project.tagline,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const readme =
    !project.private
      ? await fetchReadme(project.repoName).catch(() => null)
      : null;

  const meta = categoryMeta[project.category];
  const hasDemo = !!(project.liveUrl || project.demoUrl);
  const embedUrl = project.demoUrl || project.liveUrl;
  const langColor = project.language
    ? languageColors[project.language] || "#6B7280"
    : null;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 mb-6"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-faint)",
        }}
      >
        <Link
          href="/projects"
          className="transition-colors hover:text-[var(--color-text-muted)]"
          style={{ textDecoration: "none" }}
        >
          Projects
        </Link>
        <ChevronIcon className="w-3 h-3" />
        <span style={{ color: "var(--color-text-muted)" }}>
          {project.displayName}
        </span>
      </nav>

      {/* ── Header ──────────────────────────────────── */}
      <div className="mb-6 animate-fade-up">
        {/* Tags row */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span
            className="px-2 py-0.5 rounded-md"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-faint)",
              background: "var(--color-surface-3)",
            }}
          >
            {meta?.label || project.category}
          </span>
          <span
            className="px-2 py-0.5 rounded-md capitalize"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-faint)",
              background: "var(--color-surface-3)",
            }}
          >
            {project.type}
          </span>
          {project.private && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-md"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
                background: "var(--color-surface-3)",
              }}
            >
              <LockIcon className="w-3 h-3" />
              Private
            </span>
          )}
          {hasDemo && (
            <span
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-live)",
                background: "rgba(52, 211, 153, 0.06)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "var(--color-live)" }}
              />
              live
            </span>
          )}
        </div>

        <h1
          className="mb-2"
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
          }}
        >
          {project.displayName}
        </h1>

        <p
          className="mb-5"
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
            maxWidth: "560px",
          }}
        >
          {project.tagline}
        </p>

        {/* Primary CTA — demo link */}
        {hasDemo && (
          <a
            href={project.liveUrl || project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-150 group"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-accent)",
              background: "var(--color-accent-muted)",
              border: "1px solid var(--color-accent-subtle)",
              textDecoration: "none",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--color-accent)" }}
            />
            Open Live Demo
            <ExternalIcon className="w-3 h-3 opacity-70" />
          </a>
        )}
      </div>

      {/* ── Demo Embed ─────────────────────────────── */}
      {hasDemo && embedUrl && (
        <div
          className="mb-6 animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          <DemoEmbed
            url={embedUrl}
            title={project.displayName}
            embeddable={project.embeddable}
          />
        </div>
      )}

      {/* ── Two-column: content + sidebar ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Overview */}
          <div
            className="glass-card p-5 sm:p-6 animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            <h2
              className="mb-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                fontWeight: 500,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: "var(--color-text-faint)",
              }}
            >
              Overview
            </h2>
            <p
              className="mb-5"
              style={{
                fontSize: "var(--text-sm)",
                lineHeight: 1.7,
                color: "var(--color-text-muted)",
              }}
            >
              {project.description}
            </p>

            {project.highlights && project.highlights.length > 0 && (
              <>
                <h3
                  className="mb-2.5"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 500,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.08em",
                    color: "var(--color-text-faint)",
                  }}
                >
                  Key Highlights
                </h3>
                <ul className="space-y-2">
                  {project.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2"
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <span
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* README */}
          {readme && (
            <div
              className="glass-card p-5 sm:p-6 animate-fade-up"
              style={{ animationDelay: "140ms" }}
            >
              <h2
                className="mb-3"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  color: "var(--color-text-faint)",
                }}
              >
                Documentation
              </h2>
              <div
                className="prose-readme"
                dangerouslySetInnerHTML={{ __html: readme }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Tech Stack */}
          <div
            className="glass-card p-4 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            <h2
              className="mb-2.5"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                fontWeight: 500,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: "var(--color-text-faint)",
              }}
            >
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-md"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-muted)",
                    background: "var(--color-surface-3)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div
            className="glass-card p-4 space-y-2.5 animate-fade-up"
            style={{ animationDelay: "140ms" }}
          >
            {project.language && (
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-faint)",
                    marginBottom: "2px",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                  }}
                >
                  Language
                </div>
                <div
                  className="flex items-center gap-1.5"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: langColor || "#6B7280",
                    }}
                  />
                  {project.language}
                </div>
              </div>
            )}
            {project.lastUpdated && (
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-faint)",
                    marginBottom: "2px",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                  }}
                >
                  Updated
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text)",
                  }}
                >
                  {formatDate(project.lastUpdated)}
                </div>
              </div>
            )}
            {project.stars > 0 && (
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-faint)",
                    marginBottom: "2px",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                  }}
                >
                  Stars
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-accent)",
                  }}
                >
                  {project.stars}
                </div>
              </div>
            )}
          </div>

          {/* Private notice */}
          {project.private && (
            <div
              className="glass-card p-4 text-center animate-fade-up"
              style={{ animationDelay: "180ms" }}
            >
              <LockIcon className="w-4 h-4 mx-auto mb-1.5" />
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-faint)",
                  lineHeight: 1.5,
                }}
              >
                Source code is private.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
