import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export function ActionRow({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cx("ds-action-row", className)} {...props}>
      {children}
    </div>
  );
}
