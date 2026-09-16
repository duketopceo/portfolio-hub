import Link from "next/link";
import type { CSSProperties } from "react";
import type { EnrichedProject } from "@/lib/types";
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
        <p className="reg-label reg-label--accent">Priority systems</p>
        <h2 id="home-lead-heading">Five lead systems</h2>
        <p>
          The highest-signal work first: shipped scope, production surface,
          stack, and a direct path into each dossier.
        </p>
      </div>

      <div className="home-lead__grid">
        {projects.map((project, index) => {
          const live = isProjectLive(project);
          return (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="home-lead__card"
              style={{ "--system-accent": catColors[project.category] } as CSSProperties}
            >
              <span className="home-lead__meta">
                <span>CI-{String(registryIndexOf[index] ?? index).padStart(2, "0")}</span>
                <span>{project.private ? "Restricted" : "Public"}</span>
                <span>{live ? "Live" : "Dossier"}</span>
              </span>
              <span className="home-lead__name">{project.displayName}</span>
              <span className="home-lead__tagline">{project.tagline}</span>
              <span className="home-lead__stack">
                {project.techStack.slice(0, 4).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </span>
              <span className="home-lead__cta">Open survey file →</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
