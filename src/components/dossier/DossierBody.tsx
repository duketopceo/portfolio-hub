import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import type { EnrichedProject } from "@/lib/types";
import { isProjectLive } from "@/lib/deployments";
import { formatDate } from "@/lib/utils";
import { openRouterDemos, OPENROUTER_DEMOS_REPO_URL } from "@/data/openrouter-demos";
import { CheckIcon } from "@/components/Icons";
import { EvidencePanel, StatusMark, SurveyPlate } from "@/components/design";
import { DossierSection } from "./DossierSection";
import { DossierServicesTable } from "./DossierServicesTable";
import { DossierBackendSection } from "./DossierBackendSection";
import { ShowcaseCard } from "./ShowcaseCard";

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

interface DossierBodyProps {
  project: EnrichedProject;
  accentColor: string;
  readme: string | null;
  /** Runtime-fetched showcase markdown; only for private entries without a hand-written showcase. */
  showcaseMd: string | null;
  relatedProjects: EnrichedProject[];
}

/**
 * Main dossier body: public sections, the hand-written showcase card (private
 * entries with `showcase`), or the restricted survey plate (private without).
 */
export function DossierBody({
  project,
  accentColor,
  readme,
  showcaseMd,
  relatedProjects,
}: DossierBodyProps) {
  const slug = project.slug;
  return (
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

          {slug === "openrouter-demos" && (
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

          {project.private && project.showcase && (
            <ShowcaseCard showcase={project.showcase} />
          )}

          {project.private && !project.showcase && (
            <SurveyPlate
              className="dossier-page__private"
              metadata={["Restricted survey", "Source withheld"]}
            >
              <div className="dossier-classified-banner">
                <StatusMark tone="restricted">Restricted</StatusMark>
                <span>Classified survey file · source withheld</span>
              </div>
              <EvidencePanel
                eyebrow="Curated evidence"
                title="Publish-safe project record"
                trackAs="project-record"
                description="Approved context, ownership, architecture, decisions, and outcomes without exposing private source."
              >
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
              </EvidencePanel>
            </SurveyPlate>
          )}

          {project.highlights && project.highlights.length > 0 && (
            <DossierSection
              title="Key features"
              id={`dossier-features-${slug}`}
              surface="glass"
            >
              <ul className="ds-feature-list">
                {project.highlights.map((h, i) => (
                  <li key={i} className="ds-feature-list__row">
                    <span
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: accentColor }}
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="ds-feature-list__text">{h}</span>
                  </li>
                ))}
              </ul>
            </DossierSection>
          )}

          {showcaseMd && (
            <DossierSection
              title="Showcase"
              id={`dossier-showcase-${slug}`}
              surface="glass"
            >
              <div
                className="prose-readme"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(renderShowcaseMarkdown(showcaseMd)),
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

        <aside className="dossier-page__aside ds-stack">
          {project.lastUpdated && (
            <div className="ds-plate ds-plate__body">
              <h2 className="detail-section-label">Last activity</h2>
              <p className="detail-meta-value">
                {formatDate(project.lastUpdated)}
              </p>
            </div>
          )}

          {relatedProjects.length > 0 && (
            <div className="ds-plate ds-plate__body">
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
  );
}
