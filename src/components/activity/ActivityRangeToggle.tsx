"use client";

import {
  ACTIVITY_RANGE_OPTIONS,
  type ActivityRangeDays,
} from "@/lib/activity-aggregate";

interface ActivityRangeToggleProps {
  value: ActivityRangeDays;
  onChange: (days: ActivityRangeDays) => void;
  id?: string;
}

export function ActivityRangeToggle({
  value,
  onChange,
  id = "activity-range",
}: ActivityRangeToggleProps) {
  return (
    <div
      className="activity-range"
      role="group"
      aria-labelledby={`${id}-label`}
    >
      <span id={`${id}-label`} className="activity-range__label">
        Range
      </span>
      {ACTIVITY_RANGE_OPTIONS.map((days) => (
        <button
          key={days}
          type="button"
          className={`activity-range__btn${
            value === days ? " activity-range__btn--active" : ""
          }`}
          aria-pressed={value === days}
          onClick={() => onChange(days)}
        >
          {days}d
        </button>
      ))}
    </div>
  );
}
