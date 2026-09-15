import type { ReactNode } from "react";
import { cx } from "./cx";

export function PageShell({
  children,
  className,
  measure = "wide",
}: {
  children: ReactNode;
  className?: string;
  measure?: "readable" | "wide";
}) {
  return (
    <div className={cx("ds-page", `ds-page--${measure}`, className)}>
      {children}
    </div>
  );
}
