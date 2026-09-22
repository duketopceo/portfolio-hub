import type { ReactNode } from "react";
import { cx } from "./cx";
import { SectionHeading } from "./SectionHeading";

export function EvidencePanel({
  eyebrow,
  title,
  description,
  children,
  className,
  labelledBy,
  trackAs,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  /** Stable Umami section name for dossier-section-view impressions. */
  trackAs?: string;
}) {
  return (
    <section
      className={cx("ds-evidence", className)}
      aria-labelledby={labelledBy}
      data-umami-section={trackAs}
    >
      <SectionHeading
        classPrefix="ds-evidence"
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="ds-evidence__grid">{children}</div>
    </section>
  );
}
