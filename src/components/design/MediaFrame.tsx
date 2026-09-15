import type { ReactNode } from "react";
import { cx } from "./cx";

export function MediaFrame({
  children,
  caption,
  className,
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cx("ds-media-frame", className)}>
      {children}
      {caption && (
        <figcaption className="ds-media-frame__caption">{caption}</figcaption>
      )}
    </figure>
  );
}
