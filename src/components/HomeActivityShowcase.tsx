import Link from "next/link";
import type { HomepageActivityPayload } from "@/lib/github-activity-types";
import { LockIcon } from "@/components/Icons";

interface HomeActivityShowcaseProps {
  data: HomepageActivityPayload;
}

export function HomeActivityShowcase({ data }: HomeActivityShowcaseProps) {
  return (
    <div className="activity-strip activity-strip--showcase">
      <div className="activity-strip__label">
        <span className="activity-strip__pulse" aria-hidden />
        Last 7 days
      </div>
      <div className="activity-strip__list activity-strip__list--showcase">
        {data.lines.length === 0 ? (
          <span className="activity-strip__empty">
            GitHub activity unavailable — curated dossiers below
          </span>
        ) : (
          data.lines.map((line) => (
            <Link
              key={line.slug}
              href={line.href}
              className="activity-strip__highlight"
            >
              <span className="activity-strip__highlight-name">
                {line.displayName}:
                {line.private && (
                  <LockIcon
                    className="inline w-3 h-3 ml-1 opacity-60"
                    aria-label="Private repository"
                  />
                )}
              </span>
              <span className="activity-strip__highlight-text">
                {line.line}
              </span>
            </Link>
          ))
        )}
      </div>
      <span className="activity-strip__meta">
        {data.source === "github" ? "via GitHub App" : data.source}
      </span>
    </div>
  );
}
