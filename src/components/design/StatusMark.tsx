import type { ReactNode } from "react";
import { cx } from "./cx";

export function StatusMark({
  children,
  tone = "interactive",
  className,
}: {
  children: ReactNode;
  tone?: "interactive" | "live" | "restricted";
  className?: string;
}) {
  return (
    <span className={cx("ds-status-mark", `ds-status-mark--${tone}`, className)}>
      {children}
    </span>
  );
}
