import type { EnrichedProject } from "@/lib/types";

interface DossierBackendSectionProps {
  project: EnrichedProject;
  accentColor: string;
}

export function DossierBackendSection({
  project,
  accentColor,
}: DossierBackendSectionProps) {
  return (
    <div className="dossier-backend">
      {project.architecture && (
        <div className="dossier-backend__arch">
          <h3 className="dossier-backend__subhead">Architecture</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {project.architecture.split(" → ").map((step, i, arr) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="detail-arch-step">{step}</span>
                {i < arr.length - 1 && (
                  <span className="detail-arch-arrow">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="dossier-backend__stack">
        <h3 className="dossier-backend__subhead">Stack</h3>
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="detail-tech-chip"
              style={{ borderColor: `${accentColor}33` }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
