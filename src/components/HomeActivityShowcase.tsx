import Link from "next/link";
import type { HomepageActivityPayload } from "@/lib/github-activity-types";
import { LockIcon } from "@/components/Icons";

interface HomeActivityShowcaseProps {
  data: HomepageActivityPayload;
}

export function HomeActivityShowcase({ data }: HomeActivityShowcaseProps) {
  const lines = data.lines.slice(0, 4);

  return (
    <div className="activity-strip activity-strip--digest">
      <div className="activity-strip__label">
        <span className="activity-strip__pulse" aria-hidden />
        Last 7 days
      </div>

      {lines.length === 0 ? (
        <p className="activity-strip__empty activity-strip__digest-empty">
          GitHub activity unavailable — curated dossiers below
        </p>
      ) : (
        <ul className="activity-strip__digest-list">
          {lines.map((line) => (
            <li key={`${line.slug}-${line.line}`}>
              <Link href={line.href} className="activity-strip__digest-line">
                <span className="activity-strip__digest-repo">
                  {line.displayName}
                  {line.private && (
                    <LockIcon
                      className="inline w-3 h-3 ml-1 opacity-60"
                      aria-label="Private repository"
                    />
                  )}
                </span>
                <span className="activity-strip__digest-text">{line.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <span className="activity-strip__meta">
        {data.source === "github" ? "via GitHub App" : data.source}
      </span>
    </div>
  );
}
