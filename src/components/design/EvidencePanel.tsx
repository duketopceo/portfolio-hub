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
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      className={cx("ds-evidence", className)}
      aria-labelledby={labelledBy}
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
