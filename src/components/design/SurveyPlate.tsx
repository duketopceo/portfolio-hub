import type { ReactNode } from "react";
import { cx } from "./cx";
import { MarginRail, type MarginRailItem } from "./MarginRail";

export function SurveyPlate({
  children,
  className,
  metadata = [],
  raised = false,
}: {
  children: ReactNode;
  className?: string;
  metadata?: MarginRailItem[];
  raised?: boolean;
}) {
  return (
    <section className={cx("ds-plate", raised && "ds-plate--raised", className)}>
      <MarginRail items={metadata} className="ds-plate__margin" />
      <div className="ds-plate__body">{children}</div>
    </section>
  );
}
