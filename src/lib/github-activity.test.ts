import { describe, expect, it } from "vitest";
import {
  activityKindVerb,
  getHomepageActivityShowcase,
  getProjectActivityTimeline,
} from "./github-activity";
import { fixtureHomepageActivity } from "./github-activity-fixtures";

describe("github-activity fixtures", () => {
  it("homepage fixture returns up to 4 repos with condensed charts", async () => {
    const data = await getHomepageActivityShowcase({ useFixtures: true });
    expect(data.source).toBe("fixture");
    expect(data.repos.length).toBeGreaterThanOrEqual(1);
    expect(data.repos.length).toBeLessThanOrEqual(4);
    expect(data.repos[0].condensed.days).toHaveLength(7);
    expect(data.repos[0].condensed.showcase.length).toBeGreaterThan(0);
  });

  it("pace-server fixture condenses review flood to one PR row", async () => {
    const data = await getProjectActivityTimeline("pace-server", {
      useFixtures: true,
    });
    const { condenseProjectActivity } = await import("./activity-aggregate");
    const condensed = condenseProjectActivity(data, {
      anchorDate: new Date(data.fetchedAt),
    });
    const pr938 = condensed.showcase.find((r) => r.ref === "938");
    expect(pr938?.reviewCount).toBe(5);
    expect(pr938?.label).toBe("PR #938 — merged · 5 reviews");
  });

  it("project fixture for kurultai includes reviews, issues, releases", async () => {
    const data = await getProjectActivityTimeline("kurultai", {
      useFixtures: true,
    });
    expect(data.private).toBe(false);
    expect(data.items.some((i) => i.kind === "review")).toBe(true);
    expect(data.items.some((i) => i.kind === "issue_opened")).toBe(true);
    expect(data.items.some((i) => i.kind === "release")).toBe(true);
    expect(data.items.some((i) => i.url?.includes("github.com"))).toBe(true);
  });

  it("private fixture omits github deep links", async () => {
    const data = await getProjectActivityTimeline("khan", {
      useFixtures: true,
    });
    expect(data.private).toBe(true);
    expect(data.items.every((i) => !i.url?.includes("github.com"))).toBe(true);
    expect(data.items.some((i) => i.kind === "review")).toBe(true);
  });

  it("fixtureHomepageActivity matches shape", () => {
    const f = fixtureHomepageActivity();
    expect(f.repos.every((r) => r.href.startsWith("/projects/"))).toBe(true);
    expect(f.repos.every((r) => r.condensed.days.length === 7)).toBe(true);
    expect(f.repos.every((r) => r.activity.items.length > 0)).toBe(true);
    expect(f.historyDays).toBe(90);
    expect(f.defaultRangeDays).toBe(7);
  });

  it("activityKindVerb covers all event kinds", () => {
    expect(activityKindVerb("pr_opened")).toBe("Opened");
    expect(activityKindVerb("review")).toBe("Reviewed");
    expect(activityKindVerb("issue_opened")).toBe("Started");
    expect(activityKindVerb("issue_closed")).toBe("Finished");
  });
});
