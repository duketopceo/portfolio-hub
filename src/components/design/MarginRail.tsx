import type { ReactNode } from "react";
import { cx } from "./cx";

export type MarginRailItem =
  | ReactNode
  | { content: ReactNode; className?: string };

function isMarginRailObject(
  item: MarginRailItem,
): item is { content: ReactNode; className?: string } {
  return typeof item === "object" && item !== null && "content" in item;
}

export function MarginRail({
  items,
  className,
}: {
  items: MarginRailItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className={cx("ds-margin", className)} aria-hidden="true">
      {items.map((item, index) => {
        const entry = isMarginRailObject(item)
          ? item
          : { content: item, className: undefined };
        return (
          <span key={index} className={entry.className}>
            {entry.content}
          </span>
        );
      })}
    </div>
  );
}
