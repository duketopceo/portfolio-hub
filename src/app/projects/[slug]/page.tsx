import { notFound } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";
import DOMPurify from "isomorphic-dompurify";
import {
  GITHUB_ACCOUNT_LOGIN,
  getProjectBySlug,
  getAllSlugs,
  getEnrichedProjects,
  fetchReadme,
} from "@/lib/github";
import {
  sortPortfolioOrbit,
  getOrbitAdjacent,
} from "@/lib/project-completeness";
import { formatDate, languageColors, catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import { LockIcon, ExternalIcon, CheckIcon } from "@/components/Icons";
import DemoEmbed from "@/components/DemoEmbed";
import ProjectPreview from "@/components/ProjectPreview";
import {
  BehindTheBuild,
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
  const allProjects = sortPortfolioOrbit(await getEnrichedProjects());
  const adjacent = getOrbitAdjacent(allProjects, slug);
  if (!adjacent) notFound();

  const { project, prev: prevProject, next: nextProject } = adjacent;
  const readme = !project.private ? await fetchReadme(project.repoName) : null;
  const meta = categoryMeta[project.category];
  const hasDemo = Boolean(project.liveUrl || project.demoUrl);
  const embedUrl = (project.demoUrl || project.liveUrl) ?? "";
  const showDemoSection = hasDemo && Boolean(embedUrl);
  const useIframeEmbed =
    showDemoSection &&
    !project.demoOffline &&
    project.embeddable === true;
  const showPreview =
    !showDemoSection &&
    Boolean(
      project.architecture ||
        (project.highlights && project.highlights.length > 0)
    );
  const demoHint =
    showDemoSection && !useIframeEmbed
      ? project.demoOffline
        ? "Best viewed on the live site — opens in a new tab."
        : project.embeddable !== true
          ? "Embedding unavailable for this URL — opens in a new tab."
          : "Opens in a new tab."
      : null;
  const langColor = project.language
    ? languageColors[project.language] || "#6B7280"
    : null;
  const accentColor = catColors[project.category] || "#2dd4bf";

  const relatedProjects = allProjects
    .filter((candidate) =>
      candidate.category === project.category &&
      candidate.slug !== project.slug
    )
    .slice(0, 3);

  const pageStyle = {
    "--dossier-accent": accentColor,
  } as CSSProperties;

  return (
    <article className="dossier-page animate-fade-up" style={pageStyle}>
      <ProjectHero project={project} accentColor={accentColor} meta={meta} />

      <div className="cosmic-page dossier-page__two-col">
        <div className="dossier-page__main-stack">
          <BehindTheBuild project={project} />

          {project.highlights.length > 0 && (
            <DossierSection
              title="Capabilities"
              id={`dossier-capabilities-${slug}`}
              surface="glass"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.highlights.map((highlight, index) => (
                  <div key={`${highlight}-${index}`} className="detail-feature-card">
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
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </DossierSection>
          )}

          <DossierSection
            title="Context"
            id={`dossier-context-${slug}`}
            surface="glass"
          >
            <p className="cosmic-readable">{project.description}</p>
          </DossierSection>

          {project.private && (
            <div className="dossier-page__private">
              <div className="dossier-classified-banner">
                <LockIcon className="w-3 h-3" aria-hidden />
                Restricted · Recruitment dossier
              </div>

              {project.businessContext && (
                <div className="dossier-section">
                  <div className="dossier-section__label">Business Context</div>
                  <p className="dossier-section__body">
                    {project.businessContext}
                  </p>
                </div>
              )}

              {project.scopeAndScale && (
                <div className="dossier-section">
                  <div className="dossier-section__label">Scope &amp; Scale</div>
                  <p className="dossier-section__body">
                    {project.scopeAndScale}
                  </p>
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

          {showDemoSection && embedUrl && (
            <DossierSection
              title="Live Demo"
              id={`dossier-demo-${slug}`}
              surface="glass"
            >
              <div className="demo-frame">
                <div className="demo-frame__header">
                  <div className="demo-frame__header-text">
                    <span className="demo-frame__url">
                      {embedUrl.replace(/^https?:\/\//, "")}
                    </span>
                    {demoHint && (
                      <span className="demo-frame__hint">{demoHint}</span>
                    )}
                  </div>
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
                  embeddable={useIframeEmbed}
                />
              </div>
            </DossierSection>
          )}

          {showPreview && <ProjectPreview project={project} />}

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

        <aside className="dossier-page__aside space-y-6">
          {showDemoSection && (project.liveUrl || project.demoUrl) && (
            <a
              href={project.liveUrl || project.demoUrl || embedUrl}
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
                  textTransform: "uppercase",
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
                {(project.liveUrl || project.demoUrl || embedUrl)
                  .replace(/^https?:\/\//, "")
                  .replace(/\/$/, "")}
                <ExternalIcon className="w-3 h-3 opacity-50" />
              </div>
            </a>
          )}

          {!project.private && (
            <a
              href={`https://github.com/${GITHUB_ACCOUNT_LOGIN}/${project.repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-4 block transition-colors group"
              style={{ textDecoration: "none" }}
            >
              <div className="detail-section-label">Public Repository</div>
              <div
                className="flex items-center gap-1.5 group-hover:text-[var(--color-accent)]"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text)",
                  transition: "color 150ms",
                }}
              >
                {project.repoName}
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
                {relatedProjects.map((relatedProject) => (
                  <Link
                    key={relatedProject.slug}
                    href={`/projects/${relatedProject.slug}`}
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
                      {relatedProject.displayName}
                    </span>
                    {(relatedProject.liveUrl || relatedProject.demoUrl) &&
                      !relatedProject.demoOffline && (
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
