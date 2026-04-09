import { EnrichedProject } from "@/lib/types";
import { ExternalIcon, CheckIcon } from "./Icons";

interface ProjectPreviewProps {
  project: EnrichedProject;
}

export default function ProjectPreview({ project }: ProjectPreviewProps) {
  const archSteps = project.architecture
    ? project.architecture.split(" → ")
    : [];
  const hasLiveUrl = !!project.liveUrl;
  const hasDemoUrl = !!project.demoUrl;
  const externalUrl = project.liveUrl || project.demoUrl;

  return (
    <div
      className="glass-card overflow-hidden project-preview"
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      {/* Header bar — matches DemoEmbed browser chrome */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: "var(--color-surface-2)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "rgba(255,95,87,0.6)" }}
            />
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "rgba(255,189,46,0.6)" }}
            />
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "rgba(39,201,63,0.6)" }}
            />
          </div>
          <span
            className="ml-2"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 500,
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              color: "var(--color-text-faint)",
            }}
          >
            Project Preview
          </span>
        </div>
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-faint)",
              textDecoration: "none",
            }}
          >
            Open
            <ExternalIcon className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Content area */}
      <div className="project-preview__body">
        {/* Architecture flow */}
        {archSteps.length > 0 && (
          <div className="project-preview__section">
            <h3 className="project-preview__label">Architecture</h3>
            <div className="project-preview__flow">
              {archSteps.map((step, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="project-preview__step">{step.trim()}</span>
                  {i < archSteps.length - 1 && (
                    <span className="project-preview__arrow" aria-hidden>
                      →
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <div className="project-preview__section">
            <h3 className="project-preview__label">Highlights</h3>
            <ul className="project-preview__highlights">
              {project.highlights.map((h, i) => (
                <li key={i} className="project-preview__highlight">
                  <CheckIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status messaging */}
        <div className="project-preview__status">
          {hasLiveUrl && (
            <p className="project-preview__status-text">
              <span
                className="project-preview__status-dot"
                style={{ background: "var(--color-text-faint)" }}
              />
              Live application temporarily offline
            </p>
          )}
          {!hasLiveUrl && hasDemoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-preview__launch"
            >
              Launch Demo
              <ExternalIcon className="w-3 h-3" />
            </a>
          )}
          {!hasLiveUrl && !hasDemoUrl && project.private && (
            <p className="project-preview__status-text">
              <span
                className="project-preview__status-dot"
                style={{ background: "var(--color-text-faint)" }}
              />
              Source code available upon request for interviews
            </p>
          )}
          {!hasLiveUrl && !hasDemoUrl && !project.private && (
            <p className="project-preview__status-text">
              <span
                className="project-preview__status-dot"
                style={{ background: "var(--color-text-faint)" }}
              />
              No live demo available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
