import { expect, test } from "@playwright/test";
import { preOverhaulSlugs } from "../../src/lib/catalog.fixture";

test.describe("pre-overhaul slugs still resolve (R6)", () => {
  for (const slug of preOverhaulSlugs) {
    test(`/projects/${slug} resolves in at most one hop`, async ({ request }) => {
      const first = await request.get(`/projects/${slug}`, { maxRedirects: 0 });
      if (first.status() === 200) return;

      expect(first.status()).toBe(308);
      const location = first.headers()["location"];
      expect(location, "308 carries a Location").toBeTruthy();
      const target = new URL(location, first.url());
      const second = await request.get(target.pathname + target.search, {
        maxRedirects: 0,
      });
      expect(second.status(), `${slug} -> ${location}`).toBe(200);
    });
  }
});
