import type { ReactNode } from "react";
import { cx } from "./cx";
import { MarginRail, type MarginRailItem } from "./MarginRail";

export function PageHeader({
  eyebrow,
  title,
  lede,
  metadata = [],
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  metadata?: MarginRailItem[];
  className?: string;
}) {
  return (
    <header className={cx("ds-page-head", className)}>
      <MarginRail items={metadata} className="ds-page-head__margin" />
      {eyebrow && <p className="ds-page-head__eyebrow">{eyebrow}</p>}
      <h1 className="ds-page-head__title">{title}</h1>
      {lede && <p className="ds-page-head__lede">{lede}</p>}
    </header>
  );
}
