import { MetricRow, PageShell } from "@/components/design";
import type { ProjectMeasure } from "@/lib/types";
import { DossierSection } from "./DossierSection";

/**
 * Recorded measurements for a project (KD4), each with where, when and how it
 * was taken. Rendered only when the entry has measurements; the lead cards link
 * here (`#evidence`), so a figure on a card is always checkable.
 */
export function DossierEvidence({ measured }: { measured: readonly ProjectMeasure[] | undefined }) {
  if (!measured || measured.length === 0) return null;
  return (
    <PageShell className="dossier-page__evidence">
      <DossierSection title="Measured proof" id="evidence">
        <dl className="dossier-evidence">
          {measured.map((m) => (
            <MetricRow
              key={m.label}
              label={m.label}
              value={
                <>
                  {m.value}
                  <span className="dossier-evidence__note">
                    {m.method} Source: {m.source}. Measured {m.measuredOn}.
                  </span>
                </>
              }
            />
          ))}
        </dl>
      </DossierSection>
    </PageShell>
  );
}
