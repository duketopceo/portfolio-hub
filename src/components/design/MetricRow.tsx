import type { ReactNode } from "react";
import { cx } from "./cx";

export function MetricRow({
  label,
  value,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("ds-metric-row", className)}>
      <dt className="ds-metric-row__label">{label}</dt>
      <dd className="ds-metric-row__value">{value}</dd>
    </div>
  );
}
