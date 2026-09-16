import { expect, test } from "@playwright/test";

test.describe("production security boundaries", () => {
  test("public routes emit baseline security headers", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers["x-powered-by"]).toBeUndefined();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  });

  test("unknown project and API slugs return 404", async ({ request }) => {
    for (const path of [
      "/projects/not-a-project",
      "/api/activity/%3Cscript%3E",
      "/api/github/repo/..%2f..%2fpackage.json/summary",
      "/api/github/repo/%3Cscript%3Ealert(1)%3C%2Fscript%3E/summary",
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
    }
  });

  test("unsupported HTTP methods do not expose internals", async ({ request }) => {
    const trace = await request.fetch("/api/health", { method: "TRACE" });
    expect([405, 500]).toContain(trace.status());
    expect(await trace.text()).not.toContain("TypeError");

    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const response = await request.fetch("/api/health", { method });
      expect(response.status(), method).toBe(405);
    }
  });

  test("private project summary stays on curated fallback data", async ({
    request,
  }) => {
    const response = await request.get("/api/github/repo/Khan/summary");
    expect(response.status()).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.private).toBe(true);
    expect(body.githubPath).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain("github.com/duketopceo/Khan");
  });
});
