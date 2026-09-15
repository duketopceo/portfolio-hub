import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  classPrefix = "ds-section",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  classPrefix?: "ds-section" | "ds-evidence";
}) {
  return (
    <div className={`${classPrefix}__header`}>
      {eyebrow && <p className={`${classPrefix}__eyebrow`}>{eyebrow}</p>}
      <h2 className={`${classPrefix}__title`}>{title}</h2>
      {description && (
        <p className={`${classPrefix}__description`}>{description}</p>
      )}
    </div>
  );
}
