import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProjectBySlug,
  getAllSlugs,
  getEnrichedProjects,
  fetchReadme,
} from "@/lib/github";
import { formatDate, languageColors } from "@/lib/utils";
import { categoryMeta, projectConfigs } from "@/data/projects";
import {
  LockIcon,
  ExternalIcon,
  ChevronIcon,
  CheckIcon,
  getCategoryIcon,
} from "@/components/Icons";
import DemoEmbed from "@/components/DemoEmbed";

export const revalidate = 3600;

/** Category → accent color (mirrors QuadrantGraph) */
const catColors: Record<string, string> = {
  finance: "#2dd4bf",
  ai: "#a78bfa",
  osint: "#f59e0b",
  data: "#38bdf8",
  infra: "#f472b6",
  apps: "#34d399",
};

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
    title: `${project.displayName} — Cosmic Intelligence`,
    description: project.tagline,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allProjects = await getEnrichedProjects();
  const projectIndex = allProjects.findIndex((p) => p.slug === slug);
  if (projectIndex === -1) notFound();

  const project = allProjects[projectIndex];
  const prevProject = projectIndex > 0 ? allProjects[projectIndex - 1] : null;
  const nextProject =
    projectIndex < allProjects.length - 1
      ? allProjects[projectIndex + 1]
      : null;

  const readme = !project.private
    ? await fetchReadme(project.repoName).catch(() => null)
    : null;

  const meta = categoryMeta[project.category];
  const hasDemo = !!(project.liveUrl || project.demoUrl);
  const embedUrl = project.demoUrl || project.liveUrl;
  const langColor = project.language
    ? languageColors[project.language] || "#6B7280"
    : null;
  const accentColor = catColors[project.category] || "#2dd4bf";

  const relatedProjects = allProjects
    .filter((p) => p.category === project.category && p.slug !== project.slug)
    .slice(0, 3);

  return (
    <div className="animate-fade-up">
      {/* ── Breadcrumb ──────────────────────────────── */}
      <div
        className="mx-auto max-w-5xl px-5 sm:px-6"
        style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
      >
        <nav
          className="flex items-center gap-1.5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--color-text-faint)",
          }}
        >
          <Link
            href="/projects"
            className="transition-colors hover:text-[var(--color-text-muted)]"
            style={{ textDecoration: "none", color: "var(--color-text-faint)" }}
          >
            ← Projects
          </Link>
          <ChevronIcon className="w-3 h-3" />
          <span style={{ color: "var(--color-text-muted)" }}>
            {project.displayName}
          </span>
        </nav>
      </div>

      {/* ── Top Band — Project Hero ─────────────────── */}
      <section
        style={{
          "--project-accent": accentColor,
          background: "var(--color-surface)",
          borderTop: `2px solid ${accentColor}30`,
          borderBottom: "1px solid var(--color-border)",
          padding: "clamp(1.5rem, 3vw, 2.5rem) 0",
        } as React.CSSProperties}
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Project icon — 64px colored circle */}
            <div
              className="flex-shrink-0 rounded-xl flex items-center justify-center"
              style={{
                width: "56px",
                height: "56px",
                background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                border: `1.5px solid ${accentColor}40`,
                color: accentColor,
              }}
            >
              {getCategoryIcon(meta?.icon || "globe", "w-6 h-6")}
            </div>

            <div className="min-w-0 flex-1">
              {/* Name + badges row */}
              <div className="flex items-center flex-wrap gap-2 mb-1.5">
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {project.displayName}
                </h1>

                {/* Category badge */}
                <span
                  className="detail-cat-badge"
                  style={{ "--badge-color": accentColor } as React.CSSProperties}
                >
                  <span className="detail-cat-badge__dot" />
                  {meta?.label || project.category}
                </span>

                {project.private && (
                  <span
                    className="inline-flex items-center gap-1"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--color-text-faint)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "var(--color-surface-3)",
                    }}
                  >
                    <LockIcon className="w-3 h-3" />
                    Private
                  </span>
                )}

                {hasDemo && (
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--color-live)",
                      padding: "2px 8px",
                      borderRadius: "4px",
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

              {/* Tagline */}
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.5,
                  marginBottom: "0.75rem",
                  maxWidth: "600px",
                }}
              >
                {project.tagline}
              </p>

              {/* Tech chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.techStack.map((tech) => (
                  <span key={tech} className="detail-tech-chip">
                    {tech}
                  </span>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex items-center flex-wrap gap-2">
                {hasDemo && (
                  <a
                    href={project.liveUrl || project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-cta"
                  >
                    <span className="detail-cta__pulse" />
                    Launch Demo
                    <ExternalIcon className="w-3 h-3 opacity-80" />
                  </a>
                )}
                {project.private && (
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--color-text-faint)",
                      padding: "6px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <LockIcon className="w-3.5 h-3.5" />
                    Private Repository
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo Embed (full-width, public repos only) ── */}
      {hasDemo && embedUrl && !project.private && (
        <section
          className="mx-auto max-w-5xl px-5 sm:px-6"
          style={{ paddingTop: "clamp(1rem, 2vw, 1.5rem)" }}
        >
          <div className="demo-frame">
            <div className="demo-frame__header">
              <span className="demo-frame__url">
                {embedUrl.replace(/^https?:\/\//, "")}
              </span>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="demo-frame__open"
              >
                open ↗
              </a>
            </div>
            <DemoEmbed
              url={embedUrl}
              title={project.displayName}
              embeddable={project.embeddable}
            />
          </div>
        </section>
      )}

      {/* ── Two-column layout ───────────────────────── */}
      <div
        className="mx-auto max-w-5xl px-5 sm:px-6"
        style={{ paddingTop: "clamp(1.25rem, 2vw, 2rem)", paddingBottom: "clamp(1.25rem, 2vw, 2rem)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* ── Left Column (60%) ─────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            {/* ── Classified Dossier (private repos) ── */}
            {project.private && (
              <div>
                <div className="dossier-classified-banner">
                  <LockIcon className="w-3 h-3" />
                  ████ CLASSIFIED ████
                </div>

                {project.businessContext && (
                  <div className="dossier-section">
                    <div className="dossier-section__label">Business Context</div>
                    <p className="dossier-section__body">{project.businessContext}</p>
                  </div>
                )}

                {project.scopeAndScale && (
                  <div className="dossier-section">
                    <div className="dossier-section__label">Scope & Scale</div>
                    <p className="dossier-section__body">{project.scopeAndScale}</p>
                  </div>
                )}

                {project.engineeringDecisions && project.engineeringDecisions.length > 0 && (
                  <div className="dossier-section">
                    <div className="dossier-section__label">Engineering Decisions</div>
                    {project.engineeringDecisions.map((d, i) => {
                      const dashIdx = d.indexOf(" — ");
                      const decision = dashIdx !== -1 ? d.slice(0, dashIdx) : d;
                      const rationale = dashIdx !== -1 ? d.slice(dashIdx + 3) : null;
                      return (
                        <div key={i} className="dossier-eng-decision">
                          <span className="dossier-eng-decision__bullet" />
                          <span>
                            <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>
                              {decision}
                            </strong>
                            {rationale && ` — ${rationale}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="dossier-section">
                  <div className="dossier-section__label">Availability</div>
                  <p className="dossier-section__body">
                    Source code is available upon request for interviews and technical discussions.
                  </p>
                </div>
              </div>
            )}

            {/* About */}
            <div className="glass-card p-6 sm:p-7">
              <h2 className="detail-section-label">About This Project</h2>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  lineHeight: 1.7,
                  color: "var(--color-text-muted)",
                }}
              >
                {project.description}
              </p>
            </div>

            {/* Key Features */}
            {project.highlights && project.highlights.length > 0 && (
              <div>
                <h2 className="detail-section-label">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.highlights.map((h, i) => (
                    <div key={i} className="detail-feature-card">
                      <span
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: accentColor }}
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
              <div className="glass-card p-6 sm:p-7">
                <h2 className="detail-section-label">Architecture</h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  {project.architecture.split(" → ").map((step, i, arr) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="detail-arch-step">{step}</span>
                      {i < arr.length - 1 && (
                        <span className="detail-arch-arrow">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* README */}
            {readme && (
              <div className="glass-card p-6 sm:p-7">
                <h2 className="detail-section-label">Documentation</h2>
                <div
                  className="prose-readme"
                  dangerouslySetInnerHTML={{ __html: readme }}
                />
              </div>
            )}
          </div>

          {/* ── Right Column (40%) ────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Live URL card */}
            {hasDemo && project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 block transition-colors group"
                style={{
                  textDecoration: "none",
                  border: "1px solid var(--color-accent-subtle)",
                }}
              >
                <div
                  className="flex items-center gap-2 mb-1"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
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
                  {project.liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  <ExternalIcon className="w-3 h-3 opacity-50" />
                </div>
              </a>
            )}

            {/* Tech Stack */}
            <div className="glass-card p-4">
              <h2 className="detail-section-label">Tech Stack</h2>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span key={tech} className="detail-tech-chip">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="glass-card p-4 space-y-3">
              {project.language && (
                <div className="detail-meta-row">
                  <div className="detail-meta-label">Language</div>
                  <div className="detail-meta-value flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: langColor || "#6B7280" }}
                    />
                    {project.language}
                  </div>
                </div>
              )}
              {project.lastUpdated && (
                <div className="detail-meta-row">
                  <div className="detail-meta-label">Updated</div>
                  <div className="detail-meta-value">
                    {formatDate(project.lastUpdated)}
                  </div>
                </div>
              )}
              {project.stars > 0 && (
                <div className="detail-meta-row">
                  <div className="detail-meta-label">Stars</div>
                  <div
                    className="detail-meta-value"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {project.stars}
                  </div>
                </div>
              )}
              <div className="detail-meta-row">
                <div className="detail-meta-label">Type</div>
                <div className="detail-meta-value capitalize">
                  {project.type}
                </div>
              </div>
            </div>


            {/* Related Projects */}
            {relatedProjects.length > 0 && (
              <div className="glass-card p-4">
                <h2 className="detail-section-label">Related Projects</h2>
                <div className="space-y-1.5">
                  {relatedProjects.map((rp) => (
                    <Link
                      key={rp.slug}
                      href={`/projects/${rp.slug}`}
                      className="flex items-center gap-2 py-1.5 px-2 -mx-1 rounded-md transition-colors hover:bg-[var(--glass-bg)]"
                      style={{
                        textDecoration: "none",
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: accentColor }}
                      />
                      <span style={{ color: "var(--color-text-muted)" }}>
                        {rp.displayName}
                      </span>
                      {(rp.liveUrl || rp.demoUrl) && (
                        <span
                          className="ml-auto"
                          style={{
                            fontSize: "9px",
                            color: "var(--color-live)",
                            opacity: 0.7,
                          }}
                        >
                          live
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Prev / Next Navigation ──────────────────── */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "clamp(0.75rem, 2vw, 1.25rem) 0",
        }}
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-6 flex items-center justify-between">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              className="detail-nav-link"
            >
              <span style={{ fontSize: "13px" }}>←</span>
              {prevProject.displayName}
            </Link>
          ) : (
            <div />
          )}
          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              className="detail-nav-link"
            >
              {nextProject.displayName}
              <span style={{ fontSize: "13px" }}>→</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
