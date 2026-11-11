import type { ReactNode } from "react";
import { cx } from "./cx";

export function PageShell({
  children,
  className,
  measure = "wide",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  measure?: "readable" | "wide";
}) {
  return (
    <div id={id} className={cx("ds-page", `ds-page--${measure}`, className)}>
      {children}
    </div>
  );
}
