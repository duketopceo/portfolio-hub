import type { ReactNode } from "react";
import { ActionRow } from "./ActionRow";
import { cx } from "./cx";

export function TransmissionClose({
  title,
  children,
  actions,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("ds-transmission-close", className)}>
      <h2 className="ds-transmission-close__title">{title}</h2>
      <div className="ds-transmission-close__body">{children}</div>
      {actions && (
        <ActionRow className="ds-transmission-close__actions">
          {actions}
        </ActionRow>
      )}
    </section>
  );
}
