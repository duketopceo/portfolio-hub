import type { ProjectConfig } from "@/lib/types";
import { publicGithubUrl } from "@/lib/github-public-url";
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
    <div className="cosmic-page dossier-page__two-col">
      <div className="dossier-page__main-stack">
        <DossierSection title="Components" id="components" surface="glass">
          <ul className="dossier-components">
            {components.map((c) => {
              const href = publicGithubUrl(c.private, c.repoName);
              return (
                <li key={c.slug} className="dossier-components__item">
                  <span className="dossier-components__name">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-nav-link"
                      >
                        {c.displayName} ↗
                      </a>
                    ) : (
                      c.displayName
                    )}
                  </span>
                  <span className="dossier-components__tagline">
                    {c.tagline}
                  </span>
                </li>
              );
            })}
          </ul>
        </DossierSection>
      </div>
    </div>
  );
}
