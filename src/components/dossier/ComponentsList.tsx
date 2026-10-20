import type { ProjectConfig } from "@/lib/types";
import { GITHUB_ACCOUNT_LOGIN } from "@/lib/github-constants";
import { DossierSection } from "./DossierSection";

/**
 * Components of a parent entry (one level, no pages of their own). Public
 * components link to their GitHub repo; private ones show no link.
 */
export function ComponentsList({
  components,
}: {
  components: ProjectConfig[];
}) {
  if (components.length === 0) return null;
  return (
    <div className="cosmic-page">
      <DossierSection title="Components" id="components" surface="glass">
        <ul className="dossier-components">
          {components.map((c) => (
            <li key={c.slug} className="dossier-components__item">
              <span className="dossier-components__name">
                {c.private ? (
                  c.displayName
                ) : (
                  <a
                    href={`https://github.com/${c.repoOwner ?? GITHUB_ACCOUNT_LOGIN}/${c.repoName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-nav-link"
                  >
                    {c.displayName} ↗
                  </a>
                )}
              </span>
              <span className="dossier-components__tagline">{c.tagline}</span>
            </li>
          ))}
        </ul>
      </DossierSection>
    </div>
  );
}
