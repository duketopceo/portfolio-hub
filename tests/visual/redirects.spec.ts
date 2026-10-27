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

test.describe("folded pages redirect permanently, never 404", () => {
  const folded = [
    ["/demos", "/projects"],
    ["/demos/argus", "/projects/argus#demo"],
    ["/demos/dayflow", "/projects/dayflow-linux#demo"],
    ["/demos/kurultai", "/projects/kurultai#demo"],
    ["/demos/pixel-tycoon", "/projects"],
    ["/openrouter", "/projects/openrouter"],
    ["/now", "/about#now"],
    ["/contributions", "/about#contributions"],
    ["/contact", "/hire#contact"],
  ] as const;

  for (const [from, to] of folded) {
    test(`${from} -> ${to}`, async ({ request }) => {
      const first = await request.get(from, { maxRedirects: 0 });
      expect(first.status()).toBe(308);
      expect(first.headers()["location"]).toBe(to);
      const target = new URL(to, first.url());
      const second = await request.get(target.pathname, { maxRedirects: 0 });
      expect(second.status(), `${from} lands on a live page`).toBe(200);
    });
  }

  test("the bakeoff API keeps its path", async ({ request }) => {
    const response = await request.get("/openrouter/api/bakeoff", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(200);
  });
});
