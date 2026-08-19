import { describe, expect, it } from "vitest";
import { getHomepageActivityShowcase, getProjectActivityTimeline } from "./github-activity";
import { fixtureHomepageActivity } from "./github-activity-fixtures";

describe("github-activity fixtures", () => {
  it("homepage fixture returns featured lines", async () => {
    const data = await getHomepageActivityShowcase({ useFixtures: true });
    expect(data.source).toBe("fixture");
    expect(data.lines.length).toBeGreaterThanOrEqual(4);
    expect(data.lines[0].line).toMatch(/Khan|merged|review/i);
  });

  it("project fixture for kurultai includes public PR link", async () => {
    const data = await getProjectActivityTimeline("kurultai", {
      useFixtures: true,
    });
    expect(data.private).toBe(false);
    expect(data.items.some((i) => i.url?.includes("github.com"))).toBe(true);
  });

  it("private fixture omits github deep links", async () => {
    const data = await getProjectActivityTimeline("khan", {
      useFixtures: true,
    });
    expect(data.private).toBe(true);
    expect(data.items.every((i) => !i.url?.includes("github.com"))).toBe(true);
  });

  it("fixtureHomepageActivity matches shape", () => {
    const f = fixtureHomepageActivity();
    expect(f.lines.every((l) => l.href.startsWith("/projects/"))).toBe(true);
  });
});
