import { expect, test, type Page } from "@playwright/test";
import { dropHttpsUpgradeFromDocuments, stubThirdParty } from "./stubs";

const routes = [
  { path: "/", name: "home" },
  { path: "/projects", name: "projects" },
  { path: "/projects/khan", name: "project-dossier" },
  { path: "/projects/kate", name: "project-dossier-kate" },
  { path: "/projects/kurultai", name: "project-dossier-kurultai" },
  { path: "/projects/argus", name: "project-dossier-argus" },
  { path: "/projects/dayflow-linux", name: "project-dossier-dayflow" },
  { path: "/projects/openrouter", name: "project-dossier-openrouter" },
  { path: "/resume", name: "resume" },
  { path: "/about", name: "about" },
  { path: "/hire", name: "hire" },
  { path: "/missing-route", name: "not-found" },
] as const;

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
] as const;

const publicAlias = "hello@luke-the-duke.com";
const machineReadableRoutes = [
  "/resume.json",
  "/resume.md",
  "/llms.txt",
  "/robots.txt",
  "/sitemap.xml",
  "/api/activity",
  "/api/repos",
  "/api/github/pulls",
  "/api/github/repo/Khan/summary",
  "/api/health",
] as const;
const forbiddenPersonalInfo = [
  {
    label: "Gmail mailbox",
    pattern: /[a-z0-9._%+-]+@gmail\.com/i,
  },
  {
    label: "employer mailbox",
    pattern: /luke\.k@bartlettroofs\.com/i,
  },
  {
    label: "telephone link",
    pattern: /\bhref\s*=\s*["']\s*tel\s*:/i,
  },
  {
    label: "phone number",
    pattern: /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/,
  },
  {
    label: "precise coordinates",
    pattern:
      /(?:\b-?\d{1,3}\.\d{3,}\s*,\s*-?\d{1,3}\.\d{3,}\b|\b-?\d{1,3}\.\d{3,}\s*°\s*[NSEW]\b)/i,
  },
] as const;

const masked = [
  "canvas",
  "iframe",
  "video",
  "[data-visual-mask]",
];

function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("Portfolio visual acceptance matrix", () => {
  test.beforeEach(async ({ page }) => {
    await stubThirdParty(page);
    await dropHttpsUpgradeFromDocuments(page);
  });

  for (const route of routes) {
    for (const viewport of viewports) {
      test(`${route.name} ${viewport.name}`, async ({ page }) => {
        const consoleErrors = collectConsoleErrors(page);
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        const response = await page.goto(route.path, { waitUntil: "networkidle" });
        if (route.name === "not-found") {
          expect(response?.status()).toBe(404);
        } else {
          expect(response?.status()).toBeLessThan(400);
        }

        await expectNoHorizontalOverflow(page);
        await expect(page.locator("main")).toBeVisible();
        // The fixed full-viewport cosmic background (black hole, planets,
        // stardust, stars; canvas and SVG layers) is animated and would paint
        // over the hero; .cosmic-bg contains every such layer, so hide it for
        // baselines only. Its static renditions have their own deterministic
        // captures below (reduced motion / WebGL disabled).
        await page.addStyleTag({ content: ".cosmic-bg { display: none !important; }" });
        await expect(page).toHaveScreenshot(
          `${route.name}-${viewport.name}.png`,
          { fullPage: true, mask: masked.map((selector) => page.locator(selector)) },
        );
        const unexpectedErrors = consoleErrors.filter(
          (error) =>
            !(
              route.name === "not-found" &&
              error.includes("Failed to load resource") &&
              error.includes("404")
            ),
        );
        expect(unexpectedErrors).toEqual([]);
      });
    }
  }

  test("public routes do not expose private personal contact details", async ({
    page,
  }) => {
    const violations: string[] = [];

    for (const route of routes) {
      await page.goto(route.path, { waitUntil: "networkidle" });
      const html = await page.locator("html").evaluate((el) => el.outerHTML);
      for (const { label, pattern } of forbiddenPersonalInfo) {
        if (pattern.test(html)) violations.push(`${route.path}: ${label}`);
      }
    }

    const machineBodies: string[] = [];
    for (const path of machineReadableRoutes) {
      const response = await page.request.get(path);
      expect(response.status()).toBe(200);
      const body = await response.text();
      machineBodies.push(body);
      for (const { label, pattern } of forbiddenPersonalInfo) {
        if (pattern.test(body)) violations.push(`${path}: ${label}`);
      }
    }

    expect(violations).toEqual([]);

    await page.goto("/hire", { waitUntil: "networkidle" });
    const html = await page.locator("html").evaluate((el) => el.outerHTML);
    const emails = new Set(
      [html, ...machineBodies].flatMap((body) =>
        Array.from(
          body.matchAll(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi),
          (match) => match[0],
        ),
      ),
    );
    expect(Array.from(emails)).toEqual([publicAlias]);
  });

  // Top-3 cards with and without a video share one footprint (KTD3).
  for (const viewport of viewports) {
    for (const path of ["/", "/projects"]) {
      test(`lead cards share one height: ${path} ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(path, { waitUntil: "networkidle" });
        const heights = await page
          .locator(".lead-card")
          .evaluateAll((cards) => cards.map((c) => Math.round(c.getBoundingClientRect().height)));
        expect(heights).toHaveLength(3);
        expect(new Set(heights).size).toBe(1);
        const withVideo = await page.locator('.lead-card[data-has-video="true"]').count();
        const without = await page.locator('.lead-card[data-has-video="false"]').count();
        expect(withVideo + without).toBe(3);
      });
    }
  }

  test("no intro overlay or card torch on first visit", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL });
    const freshPage = await context.newPage();
    try {
      await freshPage.goto("/about", { waitUntil: "networkidle" });
      await expect(freshPage.locator(".welcome-intro")).toHaveCount(0);
      await expect(freshPage.getByRole("button", { name: "Got it" })).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  // The test browser renders WebGL in software (SwiftShader), so the cosmic
  // background correctly stays on its static plate; ?cosmos=live is the QA
  // override that forces the live scene.
  test("default test browser (software GL) keeps the static background plate", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".cosmic-bg")).toHaveAttribute("data-cosmos", "static");
    await expect(page.locator(".cosmic-bg .cosmos-plate svg")).toHaveCount(4);
    await expect(page.locator(".cosmic-bg canvas")).toHaveCount(0);
  });

  test("live background renders pixels in its one WebGL canvas", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/?cosmos=live", { waitUntil: "networkidle" });
    const canvases = page.locator(".cosmic-bg canvas[data-engine]");
    await expect(canvases).toHaveCount(1, { timeout: 30_000 });
    await expect(page.locator(".cosmic-bg")).toHaveAttribute("data-scene", "live", {
      timeout: 60_000,
    });

    for (let index = 0; index < 1; index += 1) {
      const canvas = canvases.nth(index);
      await expect
        .poll(
          () =>
            canvas.evaluate((element) => {
              const source = element as HTMLCanvasElement;
              const probe = document.createElement("canvas");
              probe.width = Math.max(1, Math.min(320, source.width));
              probe.height = Math.max(1, Math.min(180, source.height));
              const context = probe.getContext("2d");
              if (!context) return 0;
              context.drawImage(source, 0, 0, probe.width, probe.height);
              const pixels = context.getImageData(0, 0, probe.width, probe.height).data;
              let painted = 0;
              for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] > 0) painted += 1;
              }
              return painted;
            }),
          { timeout: 30_000 },
        )
        .toBeGreaterThan(100);
    }
  });

  test("live background is one WebGL context and a 2D stardust canvas on long pages", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/about?cosmos=live", { waitUntil: "networkidle" });
    await expect(page.locator(".cosmic-bg canvas[data-engine]")).toHaveCount(1, { timeout: 30_000 });
    // Planets are home-only: no planet bodies in the static plate off home.
    await expect(page.locator(".cosmic-bg")).toHaveAttribute("data-home", "false");
    await expect(page.locator(".cosmos-body:not(.cosmos-body--blackhole)").first()).toBeHidden();
  });

  test("live scene hands back to the static plate when WebGL context is lost", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/about?cosmos=live", { waitUntil: "networkidle" });
    await expect(page.locator(".cosmic-bg")).toHaveAttribute("data-scene", "live", {
      timeout: 60_000,
    });
    await page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>(".cosmic-bg canvas[data-engine]");
      const gl = (c?.getContext("webgl2") ?? c?.getContext("webgl")) as WebGLRenderingContext | null;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    });
    await expect(page.locator(".cosmic-bg")).toHaveAttribute("data-scene", "plate", {
      timeout: 15_000,
    });
  });

  // Deterministic captures of the static renditions (SVG + CSS): reduced
  // motion, and WebGL unavailable. No pixel tolerance games: nothing here
  // animates (animations are disabled for CSS, and no canvas mounts).
  const staticCaptures = [
    { name: "home-desktop", path: "/", width: 1440, height: 900, scroll: 0 },
    { name: "home-mobile", path: "/", width: 390, height: 844, scroll: 0 },
    { name: "home-desktop-scrolled", path: "/", width: 1440, height: 900, scroll: 900 },
    { name: "about-desktop", path: "/about", width: 1440, height: 900, scroll: 0 },
  ] as const;

  for (const capture of staticCaptures) {
    test(`static cosmic background, reduced motion: ${capture.name}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: capture.width, height: capture.height });
      await page.goto(capture.path, { waitUntil: "networkidle" });
      await expect(page.locator("canvas")).toHaveCount(0);
      await page.evaluate((y) => window.scrollTo(0, y), capture.scroll);
      await page.addStyleTag({
        content: "main, header, footer { visibility: hidden !important; }",
      });
      await expect(page.locator(".cosmic-bg")).toHaveScreenshot(
        `cosmos-reduced-${capture.name}.png`,
      );
    });
  }

  for (const capture of staticCaptures.filter((c) => c.scroll === 0 && c.name !== "about-desktop")) {
    test(`static cosmic background, WebGL unavailable: ${capture.name}`, async ({ page }) => {
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
          if (/webgl/i.test(type)) return null;
          return (original as (...a: unknown[]) => unknown).call(this, type, ...rest);
        } as typeof original;
      });
      await page.setViewportSize({ width: capture.width, height: capture.height });
      await page.goto(capture.path, { waitUntil: "networkidle" });
      await expect(page.locator(".cosmic-bg")).toHaveAttribute("data-cosmos", "static");
      await page.addStyleTag({
        content: "main, header, footer { visibility: hidden !important; }",
      });
      await expect(page.locator(".cosmic-bg")).toHaveScreenshot(
        `cosmos-nowebgl-${capture.name}.png`,
      );
    });
  }

  test("reduced motion creates no WebGL canvases", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  // The cosmic background only mounts a canvas when live (not in this
  // software-GL browser); the /hire backdrop (R18) is the only canvas here.
  test("hire backdrop renders one canvas with motion", async ({ page }) => {
    await page.goto("/hire", { waitUntil: "networkidle" });
    await expect(page.locator(".hire-backdrop canvas")).toHaveCount(1);
    await expect(page.locator("canvas")).toHaveCount(1);
  });

  test("hire backdrop creates no canvas under reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/hire", { waitUntil: "networkidle" });
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("hire backdrop creates no canvas with Save-Data", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", {
        value: { saveData: true },
      });
    });
    await page.goto("/hire", { waitUntil: "networkidle" });
    await expect(page.locator(".hire-backdrop")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("home leads with the hero, three lead cards, the signal, ranked groups and a closing row", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(/Luke\s*Kimball/i);
    await expect(page.locator(".solar-system")).toHaveCount(0);
    await expect(page.locator(".lead-card")).toHaveCount(3);
    await expect(page.locator(".home-transmissions")).toHaveCount(1);
    await expect(page.locator(".category-group").first()).toBeAttached();
    await expect(page.locator(".home-close")).toHaveCount(1);
    const order = await page.evaluate(() => {
      const top = (sel: string) => document.querySelector(sel)!.getBoundingClientRect().top;
      return [top(".lead-card"), top(".home-transmissions"), top(".category-group"), top(".home-close")];
    });
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    await expect(page.getByRole("link", { name: /See the work/ })).toHaveAttribute(
      "href",
      "/projects",
    );
  });

  test("home hero, actions and the first lead card sit above the fold at 1440x900", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    for (const locator of [
      page.locator("h1"),
      page.getByRole("link", { name: /See the work/ }),
      page.getByRole("link", { name: "Resume", exact: true }).first(),
    ]) {
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(900);
    }
    // The lead cards start on screen, so the top three read within seconds.
    const card = await page.locator(".lead-card").first().boundingBox();
    expect(card).not.toBeNull();
    expect(card!.y).toBeLessThan(900);
  });

  test("home has no horizontal overflow at tablet width", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/", { waitUntil: "networkidle" });
    await expectNoHorizontalOverflow(page);
  });

  test("header carries four links plus a GitHub icon", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/", { waitUntil: "networkidle" });
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.locator("a.site-header__link")).toHaveText([
      /Work/,
      /Resume/,
      /About/,
      /Hire/,
    ]);
    await expect(nav.getByRole("link", { name: "GitHub profile" })).toHaveCount(1);
    await expect(nav.getByText("The Show")).toHaveCount(0);
  });

  test("about carries #now and #contributions; hire carries #contact", async ({
    page,
  }) => {
    await page.goto("/about", { waitUntil: "networkidle" });
    await expect(page.locator("#now")).toHaveCount(1);
    await expect(page.locator("#contributions")).toHaveCount(1);
    await page.goto("/hire", { waitUntil: "networkidle" });
    await expect(page.locator("#contact")).toHaveCount(1);
  });

  test("dossiers with a demo carry a #demo section", async ({ page }) => {
    for (const slug of ["argus", "kurultai", "dayflow-linux", "openrouter"]) {
      await page.goto(`/projects/${slug}#demo`, { waitUntil: "networkidle" });
      await expect(page.locator("#demo")).toHaveCount(1);
    }
  });

  test("header and footer carry no status strip or repeated project list", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".site-header__status")).toHaveCount(0);
    await expect(page.getByText("FIELD OPERATION")).toHaveCount(0);
    await expect(page.locator(".cosmic-footer__index")).toHaveCount(0);
    await expect(page.locator(".site-header__link")).toHaveCount(4);
  });

  test("external embeds carry accessible fallback metadata", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    const embeds = page.locator("iframe");
    const count = await embeds.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(embeds.nth(index)).toHaveAttribute("title", /.+/);
      await expect(embeds.nth(index)).toHaveAttribute("loading", "lazy");
    }
  });

  test("meaningful copy stays at or above the 12px floor", async ({ page }) => {
    const violations: string[] = [];

    for (const route of routes) {
      await page.goto(route.path, { waitUntil: "networkidle" });
      const routeViolations = await page.locator("main :not(svg):not(svg *)").evaluateAll(
        (elements) =>
          elements.flatMap((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            const hasDirectText = Array.from(element.childNodes).some(
              (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
            );
            if (
              !hasDirectText ||
              style.visibility === "hidden" ||
              style.display === "none" ||
              rect.width === 0 ||
              rect.height === 0
            ) {
              return [];
            }
            const size = parseFloat(style.fontSize);
            return size < 12
              ? [`${element.tagName.toLowerCase()}.${element.className}: ${size}px`]
              : [];
          }),
      );
      violations.push(
        ...routeViolations.map((violation) => `${route.path} ${violation}`),
      );
    }

    expect(violations).toEqual([]);
  });

  test("keyboard focus changes to a visible indicator", async ({ page }) => {
    await page.goto("/hire", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) return null;
      const focusedStyle = getComputedStyle(active);
      const focused = {
        tag: active.tagName,
        focusVisible: active.matches(":focus-visible"),
        outlineWidth: focusedStyle.outlineWidth,
        outlineStyle: focusedStyle.outlineStyle,
        boxShadow: focusedStyle.boxShadow,
      };
      active.blur();
      const restingStyle = getComputedStyle(active);
      return {
        ...focused,
        restingOutlineWidth: restingStyle.outlineWidth,
        restingOutlineStyle: restingStyle.outlineStyle,
        restingBoxShadow: restingStyle.boxShadow,
      };
    });
    expect(focus).not.toBeNull();
    expect(focus!.tag).toMatch(/^(A|BUTTON)$/);
    expect(focus!.focusVisible).toBe(true);
    expect(
      focus!.outlineWidth !== focus!.restingOutlineWidth ||
        focus!.outlineStyle !== focus!.restingOutlineStyle ||
        focus!.boxShadow !== focus!.restingBoxShadow,
    ).toBe(true);
    expect(
      (focus!.outlineStyle !== "none" && focus!.outlineWidth !== "0px") ||
        focus!.boxShadow !== "none",
    ).toBe(true);
  });
});
