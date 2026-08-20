import { notFound } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";
import DOMPurify from "isomorphic-dompurify";
import {
  getProjectBySlug,
  getAllSlugs,
  getEnrichedProjects,
  fetchReadme,
  fetchShowcaseMd,
  enrichProjectActivity,
} from "@/lib/github";
import {
  sortPortfolioOrbit,
  getOrbitAdjacent,
} from "@/lib/project-completeness";
import { isProjectLive } from "@/lib/deployments";
import { formatDate, catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import { openRouterDemos, OPENROUTER_DEMOS_REPO_URL } from "@/data/openrouter-demos";
import { CheckIcon } from "@/components/Icons";
import DemoEmbed from "@/components/DemoEmbed";
import ProjectDemoVideo from "@/components/ProjectDemoVideo";
import {
  DossierSection,
  ProjectHero,
  DossierFooterNav,
  DossierServicesTable,
  DossierActivityTimeline,
  DossierBackendSection,
} from "@/components/dossier";
import { getProjectActivityTimeline } from "@/lib/github-activity";

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

function renderShowcaseMarkdown(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("");
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

  const { project: baseProject, prev: prevProject, next: nextProject } =
    adjacent;

  const project = await enrichProjectActivity(baseProject);
  const githubActivity = await getProjectActivityTimeline(slug);

  const readme =
    !project.private && !project.siteOnly
      ? await fetchReadme(project.repoName)
      : null;

  const showcase =
    project.private && !project.siteOnly
      ? await fetchShowcaseMd(project.repoName)
      : null;

  const meta = categoryMeta[project.category];
  const hasDemo = isProjectLive(project);
  const embedUrl = project.liveUrl || project.demoUrl || "";
  const isExternalEmbed =
    hasDemo && embedUrl.startsWith("http") && !project.private;
  const useIframeEmbed =
    isExternalEmbed && !project.demoOffline && project.embeddable === true;

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

      {project.demoVideoUrl && !project.private && (
        <section
          className="cosmic-page"
          style={{ paddingTop: "clamp(1.5rem, 3vw, 2.5rem)" }}
        >
          <ProjectDemoVideo
            src={project.demoVideoUrl}
            title={project.displayName}
          />
        </section>
      )}

      <DossierActivityTimeline
        project={project}
        activity={githubActivity}
      />

      <div className="cosmic-page dossier-page__two-col">
        <div className="dossier-page__main-stack">
          <DossierSection
            title="What it is"
            id={`dossier-about-${slug}`}
            surface="glass"
          >
            <p className="cosmic-readable">{project.description}</p>
          </DossierSection>

          <DossierSection
            title="Backend"
            id={`dossier-backend-${slug}`}
            surface="glass"
          >
            <DossierBackendSection
              project={project}
              accentColor={accentColor}
            />
          </DossierSection>

          <DossierSection
            title="Production services"
            id={`dossier-services-${slug}`}
            surface="glass"
          >
            <DossierServicesTable slug={slug} />
          </DossierSection>

          {slug === "openrouter" && (
            <DossierSection
              title="Application demos"
              id={`dossier-demos-${slug}`}
              surface="glass"
            >
              <div className="openrouter-grid openrouter-grid--dossier">
                {openRouterDemos.map((demo) => (
                  <article key={demo.slug} className="openrouter-card">
                    <h3 className="openrouter-card__title">{demo.name}</h3>
                    <span className="openrouter-card__role">{demo.role}</span>
                    <p className="openrouter-card__summary">{demo.summary}</p>
                    <p className="openrouter-card__note">{demo.scoring}</p>
                    <a
                      href={demo.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-nav-link"
                    >
                      Source: {demo.slug}/ ↗
                    </a>
                  </article>
                ))}
              </div>
              <p className="mt-4">
                <a
                  href={OPENROUTER_DEMOS_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-nav-link"
                >
                  Full repo on GitHub ↗
                </a>
                {" · "}
                <Link href="/openrouter" className="detail-nav-link">
                  Demo showcase page →
                </Link>
              </p>
            </DossierSection>
          )}

          {project.finishLine && (
            <DossierSection
              title="Finish line"
              id={`dossier-finish-${slug}`}
              surface="glass"
            >
              <p className="cosmic-readable">{project.finishLine}</p>
            </DossierSection>
          )}

          {project.private && (
            <div className="dossier-page__private">
              <div className="dossier-classified-banner">
                Restricted · Recruitment dossier — source not exposed here
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

              {project.engineeringDecisions &&
                project.engineeringDecisions.length > 0 && (
                  <div className="dossier-section">
                    <div className="dossier-section__label">
                      Engineering Decisions
                    </div>
                    {project.engineeringDecisions.map((d, i) => (
                      <p key={i} className="dossier-section__body">
                        {d}
                      </p>
                    ))}
                  </div>
                )}
            </div>
          )}

          {project.highlights && project.highlights.length > 0 && (
            <DossierSection
              title="Key features"
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
                    <span className="detail-feature-card__text">{h}</span>
                  </div>
                ))}
              </div>
            </DossierSection>
          )}

          {showcase && (
            <DossierSection
              title="Showcase"
              id={`dossier-showcase-${slug}`}
              surface="glass"
            >
              <div
                className="prose-readme"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(renderShowcaseMarkdown(showcase)),
                }}
              />
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

        <aside className="dossier-page__aside space-y-6">
          {project.lastUpdated && (
            <div className="glass-card p-4">
              <h2 className="detail-section-label">Last activity</h2>
              <p className="detail-meta-value">
                {formatDate(project.lastUpdated)}
              </p>
            </div>
          )}

          {relatedProjects.length > 0 && (
            <div className="glass-card p-4">
              <h2 className="detail-section-label">Related projects</h2>
              <div className="space-y-1.5">
                {relatedProjects.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/projects/${rp.slug}`}
                    className="dossier-related-link"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: accentColor }}
                    />
                    <span>{rp.displayName}</span>
                    {isProjectLive(rp) && (
                      <span className="dossier-related-link__live">live</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {useIframeEmbed && embedUrl && (
        <section className="cosmic-page dossier-page__demo">
          <div className="demo-frame">
            <div className="demo-frame__header">
              <span className="demo-frame__url">
                {embedUrl.replace(/^https?:\/\//, "")}
              </span>
            </div>
            <DemoEmbed
              url={embedUrl}
              title={project.displayName}
              embeddable
            />
          </div>
        </section>
      )}

      <DossierFooterNav prev={prevProject} next={nextProject} />
    </article>
  );
}
