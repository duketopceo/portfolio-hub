import Link from "next/link";
import type { CSSProperties } from "react";
import { mediaAsset, type EnrichedProject } from "@/lib/types";
import { isProjectLive } from "@/lib/deployments";
import { catColors } from "@/lib/utils";

interface HomeLeadSystemsProps {
  projects: EnrichedProject[];
  registryIndexOf: number[];
}

export function HomeLeadSystems({
  projects,
  registryIndexOf,
}: HomeLeadSystemsProps) {
  return (
    <section className="home-lead" aria-labelledby="home-lead-heading">
      <div className="home-section__head">
        <p className="reg-label reg-label--accent">Lead work</p>
        <h2 id="home-lead-heading">Five systems I would show first</h2>
        <p>Each one is shipped, documented, and has a dossier with the evidence.</p>
      </div>

      <div className="home-lead__grid">
        {projects.map((project, index) => {
          const live = isProjectLive(project);
          const status = live ? "Live" : project.private ? "Private" : "Open source";
          const hasFilm = mediaAsset(project.media.release) !== null;
          const proof = project.highlights[0];
          return (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="home-lead__card"
              style={{ "--system-accent": catColors[project.category] } as CSSProperties}
              data-umami-event="survey-file-open"
              data-umami-event-slug={project.slug}
              data-umami-event-source="lead-card"
            >
              <span className="home-lead__meta">
                <span>{status}</span>
                {hasFilm && <span>Launch film</span>}
                <span className="home-lead__reg" aria-hidden="true">
                  CI-{String((registryIndexOf[index] ?? index) + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="home-lead__name">{project.displayName}</span>
              <span className="home-lead__tagline">{project.tagline}</span>
              {proof && <span className="home-lead__proof">{proof}</span>}
              <span className="home-lead__stack">
                {project.techStack.slice(0, 4).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </span>
              <span className="home-lead__cta">Read dossier →</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
