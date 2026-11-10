import { describe, expect, it } from "vitest";
import { GET as summaryGet } from "./github/repo/[repoName]/summary/route";
import { GET as bakeoffGet } from "../openrouter/api/bakeoff/route";

const summaryCtx = (repoName: string) => ({
  params: Promise.resolve({ repoName }),
});

describe("GET /api/github/repo/[repoName]/summary", () => {
  it("returns 404, not 500, for malformed percent-encoding", async () => {
    const res = await summaryGet(new Request("http://x"), summaryCtx("%E0%A4%A"));
    expect(res.status).toBe(404);
  });

  it("returns 404 for traversal-shaped and unknown names", async () => {
    for (const name of ["..%2f..%2fuser", "../../etc/passwd", "nope", "%00"]) {
      const res = await summaryGet(new Request("http://x"), summaryCtx(name));
      expect(res.status).toBe(404);
    }
  });
});

describe("GET /openrouter/api/bakeoff", () => {
  it("serves the bundled snapshot without leaking error detail", async () => {
    const res = bakeoffGet();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Object.keys(body).length).toBeGreaterThan(0);
    expect(JSON.stringify(body)).not.toContain("detail");
  });
});
