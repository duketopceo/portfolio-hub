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
  const liveDisplayUrl = project.liveUrl
    ? project.liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
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

      {/* ── Hero Section ─────────────────────────────── */}
      <div className="mb-8 animate-fade-up">
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
          className="mb-3"
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
            maxWidth: "640px",
          }}
        >
          {project.tagline}
        </p>

        {/* Primary CTA — large demo button + visible URL */}
        {hasDemo && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href={project.liveUrl || project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg transition-all duration-150 group"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-bg)",
                background: "var(--color-accent)",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "currentColor", opacity: 0.7 }}
              />
              View Live Application
              <ExternalIcon className="w-3.5 h-3.5 opacity-80" />
            </a>
            {liveDisplayUrl && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-faint)",
                }}
              >
                {liveDisplayUrl}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Demo Embed ─────────────────────────────── */}
      {hasDemo && embedUrl && (
        <div
          className="mb-8 animate-fade-up"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* What It Does */}
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
              What It Does
            </h2>
            <p
              style={{
                fontSize: "var(--text-sm)",
                lineHeight: 1.8,
                color: "var(--color-text-muted)",
              }}
            >
              {project.description}
            </p>
          </div>

          {/* Key Features — styled as a grid */}
          {project.highlights && project.highlights.length > 0 && (
            <div
              className="animate-fade-up"
              style={{ animationDelay: "120ms" }}
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
                Key Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {project.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="glass-card p-4 flex items-start gap-2.5"
                  >
                    <span
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "var(--color-accent)" }}
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {h}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture */}
          {project.architecture && (
            <div
              className="glass-card p-5 sm:p-6 animate-fade-up"
              style={{ animationDelay: "160ms" }}
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
                Architecture
              </h2>
              <div
                className="flex flex-wrap items-center gap-2"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                }}
              >
                {project.architecture.split(" → ").map((step, i, arr) => (
                  <span key={i} className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-md"
                      style={{
                        color: "var(--color-text-muted)",
                        background: "var(--color-surface-3)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {step}
                    </span>
                    {i < arr.length - 1 && (
                      <span style={{ color: "var(--color-text-faint)" }}>
                        <ChevronIcon className="w-3 h-3" />
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* README */}
          {readme && (
            <div
              className="glass-card p-5 sm:p-6 animate-fade-up"
              style={{ animationDelay: "200ms" }}
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
          {/* Live URL card */}
          {hasDemo && liveDisplayUrl && (
            <a
              href={project.liveUrl || project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-4 block transition-colors animate-fade-up group"
              style={{
                animationDelay: "100ms",
                textDecoration: "none",
                border: "1px solid var(--color-accent-subtle)",
              }}
            >
              <div
                className="flex items-center gap-2 mb-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  color: "var(--color-live)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "var(--color-live)" }}
                />
                Live Application
              </div>
              <div
                className="flex items-center gap-1.5 group-hover:text-[var(--color-accent)]"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text)",
                  transition: "color 150ms",
                }}
              >
                {liveDisplayUrl}
                <ExternalIcon className="w-3 h-3 opacity-50" />
              </div>
            </a>
          )}

          {/* Tech Stack */}
          <div
            className="glass-card p-4 animate-fade-up"
            style={{ animationDelay: "120ms" }}
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
            style={{ animationDelay: "160ms" }}
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

          {/* Private repo notice — professional */}
          {project.private && (
            <div
              className="glass-card p-4 animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              <div
                className="flex items-center gap-2 mb-2"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  color: "var(--color-text-faint)",
                }}
              >
                <LockIcon className="w-3.5 h-3.5" />
                Private Repository
              </div>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-faint)",
                  lineHeight: 1.6,
                }}
              >
                Source code is available upon request for interviews and
                technical discussions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
