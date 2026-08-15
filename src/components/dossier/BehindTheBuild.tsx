import type { ProjectConfig } from "@/lib/types";
import { DossierSection } from "./DossierSection";

interface BehindTheBuildProps {
  project: Pick<
    ProjectConfig,
    "slug" | "description" | "architecture" | "engineeringDecisions"
  >;
}

function getOpeningLine(description: string): string {
  const sentence = description.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  return sentence || description;
}

/** Architecture and trade-offs lead every project dossier. */
export function BehindTheBuild({ project }: BehindTheBuildProps) {
  const architectureSteps = project.architecture?.split(" → ") ?? [];
  const decisions = project.engineeringDecisions ?? [];
  const hasBehindDetails = architectureSteps.length > 0 || decisions.length > 0;

  return (
    <DossierSection
      title="Behind the Build"
      id={`dossier-behind-${project.slug}`}
      surface="glass"
    >
      {architectureSteps.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section__label">Architecture Pipeline</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {architectureSteps.map((step, index) => (
              <span key={`${step}-${index}`} className="flex items-center gap-1.5">
                <span className="detail-arch-step">{step}</span>
                {index < architectureSteps.length - 1 && (
                  <span className="detail-arch-arrow">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {decisions.length > 0 && (
        <div className="dossier-section">
          <div className="dossier-section__label">Engineering Decisions</div>
          {decisions.map((entry, index) => {
            const dashIndex = entry.indexOf(" — ");
            const decision = dashIndex === -1 ? entry : entry.slice(0, dashIndex);
            const rationale =
              dashIndex === -1 ? null : entry.slice(dashIndex + 3);

            return (
              <div key={`${entry}-${index}`} className="dossier-eng-decision">
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

      {!hasBehindDetails && (
        <p className="cosmic-readable">{getOpeningLine(project.description)}</p>
      )}
    </DossierSection>
  );
}
