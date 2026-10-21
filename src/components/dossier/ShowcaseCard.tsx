import type { ProjectShowcase } from "@/lib/types";
import { EvidencePanel, SurveyPlate } from "@/components/design";

/**
 * Hand-written card for private entries. Renders `showcase` fields only:
 * no fetched text, no repo link, no activity data.
 */
export function ShowcaseCard({ showcase }: { showcase: ProjectShowcase }) {
  const rows: Array<[string, string]> = [
    ["What it is", showcase.whatItIs],
    ["Who it is for", showcase.whoItsFor],
    ["What Luke built", showcase.whatLukeBuilt],
    ["Status", showcase.status],
  ];
  const extra: Array<[string, string | undefined]> = [
    ["Problem", showcase.problem],
    ["Approach", showcase.approach],
    ["Architecture", showcase.architecture],
    ["Outcomes", showcase.outcomes],
  ];
  return (
    <SurveyPlate
      className="dossier-page__showcase"
      metadata={["Showcase", "Source withheld"]}
    >
      <EvidencePanel
        eyebrow="Hand-written"
        title="Project showcase"
        trackAs="Showcase card"
        description="Written for this page. The source stays private."
      >
        {rows.map(([label, text]) => (
          <div key={label} className="dossier-section">
            <div className="dossier-section__label">{label}</div>
            <p className="dossier-section__body">{text}</p>
          </div>
        ))}
        <div className="dossier-section">
          <div className="dossier-section__label">Stack</div>
          <ul className="dossier-showcase__stack">
            {showcase.stack.map((s) => (
              <li key={s} className="dossier-showcase__chip">
                {s}
              </li>
            ))}
          </ul>
        </div>
        {extra.map(([label, text]) =>
          text ? (
            <div key={label} className="dossier-section">
              <div className="dossier-section__label">{label}</div>
              <p className="dossier-section__body">{text}</p>
            </div>
          ) : null
        )}
      </EvidencePanel>
    </SurveyPlate>
  );
}
