import { describe, expect, it } from "vitest";
import {
  activityKindVerb,
  getHomepageActivityShowcase,
  getProjectActivityTimeline,
} from "./github-activity";
import { fixtureHomepageActivity } from "./github-activity-fixtures";

describe("github-activity fixtures", () => {
  it("homepage fixture returns 5–10 featured lines", async () => {
    const data = await getHomepageActivityShowcase({ useFixtures: true });
    expect(data.source).toBe("fixture");
    expect(data.lines.length).toBeGreaterThanOrEqual(5);
    expect(data.lines.length).toBeLessThanOrEqual(10);
    expect(data.lines[0].line).toMatch(/merged|review|release/i);
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
    expect(f.lines.every((l) => l.href.startsWith("/projects/"))).toBe(true);
  });

  it("activityKindVerb covers all event kinds", () => {
    expect(activityKindVerb("pr_opened")).toBe("Opened");
    expect(activityKindVerb("review")).toBe("Reviewed");
    expect(activityKindVerb("issue_opened")).toBe("Started");
    expect(activityKindVerb("issue_closed")).toBe("Finished");
  });
});
