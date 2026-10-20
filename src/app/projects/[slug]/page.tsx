import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
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
import { componentsOf } from "@/lib/catalog";
import { catColors } from "@/lib/utils";
import { categoryMeta } from "@/data/projects";
import DemoEmbed from "@/components/DemoEmbed";
import {
  ProjectHero,
  DossierFooterNav,
  DossierActivityTimeline,
  DossierBody,
  ProjectFilm,
  ComponentsList,
} from "@/components/dossier";
import { getProjectActivityTimeline } from "@/lib/github-activity";
import { MediaFrame, PageShell } from "@/components/design";

export const revalidate = 3600;
export const dynamicParams = false;

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
  const sourceProjects = await getEnrichedProjects();
  const registryIndex = sourceProjects.findIndex((p) => p.slug === slug);
  const allProjects = sortPortfolioOrbit(sourceProjects);
  const adjacent = getOrbitAdjacent(allProjects, slug);
  if (!adjacent) notFound();

  const { project: baseProject, prev: prevProject, next: nextProject } =
    adjacent;

  const project = await enrichProjectActivity(baseProject);
  const hasShowcase = Boolean(project.private && project.showcase);
  const githubActivity = hasShowcase
    ? null
    : await getProjectActivityTimeline(slug);

  const readme =
    !project.private && !project.siteOnly
      ? await fetchReadme(project.repoName, project.repoOwner)
      : null;

  const showcaseMd =
    project.private && !project.showcase && !project.siteOnly
      ? await fetchShowcaseMd(project.repoName, project.repoOwner)
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
      <ProjectHero
        project={project}
        accentColor={accentColor}
        meta={meta}
        registryIndex={registryIndex}
      />

      {project.film && (
        <PageShell className="dossier-page__demo">
          <ProjectFilm film={project.film} title={project.displayName} />
        </PageShell>
      )}

      {githubActivity && (
        <DossierActivityTimeline
          project={project}
          activity={githubActivity}
        />
      )}

      <DossierBody
        project={project}
        accentColor={accentColor}
        readme={readme}
        showcaseMd={showcaseMd}
        relatedProjects={relatedProjects}
      />

      {useIframeEmbed && embedUrl && (
        <PageShell className="dossier-page__demo">
          <MediaFrame caption={embedUrl.replace(/^https?:\/\//, "")}>
            <DemoEmbed
              url={embedUrl}
              title={project.displayName}
              embeddable
            />
          </MediaFrame>
        </PageShell>
      )}

      <ComponentsList components={componentsOf(slug)} />

      <DossierFooterNav prev={prevProject} next={nextProject} />
    </article>
  );
}
