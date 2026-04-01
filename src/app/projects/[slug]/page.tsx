import { notFound } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";
import DOMPurify from "isomorphic-dompurify";
import {
  getProjectBySlug,
  getAllSlugs,
  getEnrichedProjects,
  fetchReadme,
} from "@/lib/github";
import { formatDate, languageColors, catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import {
  LockIcon,
  ExternalIcon,
  CheckIcon,
} from "@/components/Icons";
import DemoEmbed from "@/components/DemoEmbed";
import {
  DossierSection,
  ProjectHero,
  DossierFooterNav,
} from "@/components/dossier";

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
    title: project.displayName,
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

  const readme = !project.private ? await fetchReadme(project.repoName) : null;

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

  const pageStyle = {
    "--dossier-accent": accentColor,
  } as CSSProperties;

  return (
    <article className="dossier-page animate-fade-up" style={pageStyle}>
      <ProjectHero project={project} accentColor={accentColor} meta={meta} />

      {hasDemo && embedUrl && !project.private && (
        <section
          className="cosmic-page"
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

      <div className="cosmic-page dossier-page__two-col">
        <div className="dossier-page__main-stack">
          {project.private && (
            <div className="dossier-page__private">
              <div className="dossier-classified-banner">
                <LockIcon className="w-3 h-3" aria-hidden />
                Restricted · Recruitment dossier
              </div>

              {project.businessContext && (
                <div className="dossier-section">
                  <div className="dossier-section__label">Business Context</div>
                  <p className="dossier-section__body">{project.businessContext}</p>
                </div>
              )}

              {project.scopeAndScale && (
                <div className="dossier-section">
                  <div className="dossier-section__label">Scope &amp; Scale</div>
                  <p className="dossier-section__body">{project.scopeAndScale}</p>
                </div>
              )}

              {project.engineeringDecisions &&
                project.engineeringDecisions.length > 0 && (
                  <div className="dossier-section">
                    <div className="dossier-section__label">
                      Engineering Decisions
                    </div>
                    {project.engineeringDecisions.map((d, i) => {
                      const dashIdx = d.indexOf(" — ");
                      const decision = dashIdx !== -1 ? d.slice(0, dashIdx) : d;
                      const rationale =
                        dashIdx !== -1 ? d.slice(dashIdx + 3) : null;
                      return (
                        <div key={i} className="dossier-eng-decision">
                          <span className="dossier-eng-decision__bullet" />
                          <span>
                            <strong
                              style={{
                                color: "var(--color-text)",
                                fontWeight: 500,
                              }}
                            >
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
                  Source code is available upon request for interviews and
                  technical discussions.
                </p>
              </div>
            </div>
          )}

          <DossierSection
            title="About This Project"
            id={`dossier-about-${slug}`}
            surface="glass"
          >
            <p className="cosmic-readable">{project.description}</p>
          </DossierSection>

          {project.highlights && project.highlights.length > 0 && (
            <DossierSection
              title="Key Features"
              id={`dossier-features-${slug}`}
              surface="glass"
            >
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
            </DossierSection>
          )}

          {project.architecture && (
            <DossierSection
              title="Architecture"
              id={`dossier-arch-${slug}`}
              surface="glass"
            >
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
            </DossierSection>
          )}

          {readme && (
            <DossierSection
              title="Documentation"
              id={`dossier-readme-${slug}`}
              surface="glass"
            >
              <div
                className="prose-readme"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(readme) }}
              />
            </DossierSection>
          )}
        </div>

        <aside className="dossier-page__aside space-y-5">
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
                {project.liveUrl
                  .replace(/^https?:\/\//, "")
                  .replace(/\/$/, "")}
                <ExternalIcon className="w-3 h-3 opacity-50" />
              </div>
            </a>
          )}

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
              <div className="detail-meta-value capitalize">{project.type}</div>
            </div>
          </div>

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
        </aside>
      </div>

      <DossierFooterNav prev={prevProject} next={nextProject} />
    </article>
  );
}
