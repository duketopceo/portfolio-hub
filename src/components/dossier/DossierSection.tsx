import type { ReactNode } from "react";

export interface DossierSectionProps {
  /** Section heading (visible + `id` for `aria-labelledby`) */
  title: string;
  id: string;
  children: ReactNode;
  /** `glass` = default card surface; `plain` = title + content only (use inside another surface) */
  surface?: "glass" | "plain";
  className?: string;
}

/**
 * Standard content block for project dossier pages — same padding and title style on every slug.
 */
export function DossierSection({
  title,
  id,
  children,
  surface = "glass",
  className = "",
}: DossierSectionProps) {
  const surfaceClass =
    surface === "glass"
      ? "dossier-surface dossier-surface--glass"
      : "dossier-surface dossier-surface--plain";

  return (
    <section
      className={`${surfaceClass} ${className}`.trim()}
      aria-labelledby={id}
      data-umami-section={title}
    >
      <h2 id={id} className="detail-section-label">
        {title}
      </h2>
      {children}
    </section>
  );
}
