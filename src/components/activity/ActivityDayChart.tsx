import type { ActivityDaySeries } from "@/lib/activity-aggregate";

interface ActivityDayChartProps {
  days: ActivityDaySeries[];
  compact?: boolean;
  id?: string;
}

export function ActivityDayChart({ days, compact, id }: ActivityDayChartProps) {
  const maxTotal = Math.max(
    1,
    ...days.map((d) => d.merged + d.opened + d.reviews + d.releases)
  );

  const chartHeight = compact ? "2.5rem" : "4rem";

  const summary = days
    .map(
      (d) =>
        `${d.label}: ${d.merged} merged, ${d.opened} opened, ${d.reviews} reviews`
    )
    .join("; ");

  return (
    <div
      className={`activity-chart${compact ? " activity-chart--compact" : ""}`}
      role="img"
      aria-label={`Activity by day. ${summary}`}
      id={id}
    >
      <div className="activity-chart__cols">
        {days.map((day) => {
          const total =
            day.merged + day.opened + day.reviews + day.releases;

          return (
            <div key={day.date} className="activity-chart__col">
              <div
                className="activity-chart__stack"
                style={{
                  height: chartHeight,
                  opacity: total > 0 ? 0.35 + (total / maxTotal) * 0.65 : 0.35,
                }}
              >
                {day.releases > 0 && (
                  <div
                    className="activity-chart__seg activity-chart__seg--release"
                    style={{
                      flexGrow: day.releases,
                    }}
                    title={`${day.releases} release${day.releases !== 1 ? "s" : ""}`}
                  />
                )}
                {day.merged > 0 && (
                  <div
                    className="activity-chart__seg activity-chart__seg--merged"
                    style={{ flexGrow: day.merged }}
                    title={`${day.merged} merged`}
                  />
                )}
                {day.opened > 0 && (
                  <div
                    className="activity-chart__seg activity-chart__seg--opened"
                    style={{ flexGrow: day.opened }}
                    title={`${day.opened} opened`}
                  />
                )}
                {day.reviews > 0 && (
                  <div
                    className="activity-chart__seg activity-chart__seg--review"
                    style={{ flexGrow: day.reviews }}
                    title={`${day.reviews} reviews`}
                  />
                )}
                {total === 0 && (
                  <div
                    className="activity-chart__seg activity-chart__seg--empty"
                    style={{ flexGrow: 1, opacity: 0.15 }}
                  />
                )}
              </div>
              <span className="activity-chart__label">{day.label}</span>
            </div>
          );
        })}
      </div>
      <div className="activity-chart__legend" aria-hidden>
        <span>
          <i className="activity-chart__dot activity-chart__dot--merged" />
          merged
        </span>
        <span>
          <i className="activity-chart__dot activity-chart__dot--opened" />
          opened
        </span>
        <span>
          <i className="activity-chart__dot activity-chart__dot--review" />
          reviews
        </span>
        <span>
          <i className="activity-chart__dot activity-chart__dot--release" />
          release
        </span>
      </div>
    </div>
  );
}
