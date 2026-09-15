import { expect, test, type Page } from "@playwright/test";

const routes = [
  { path: "/", name: "home" },
  { path: "/projects", name: "projects" },
  { path: "/projects/khan", name: "project-dossier" },
  { path: "/openrouter", name: "openrouter" },
  { path: "/resume", name: "resume" },
  { path: "/now", name: "now" },
  { path: "/about", name: "about" },
  { path: "/hire", name: "hire" },
  { path: "/contact", name: "contact" },
  { path: "/missing-route", name: "not-found" },
] as const;

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
] as const;

const utcStatusSelector = ".site-header__status-item[aria-label='UTC time']";
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
  "[data-visual-mask]",
  utcStatusSelector,
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
    await page.addInitScript(() => {
      localStorage.setItem("lk_welcomed", "1");
    });
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

  test("dismissed introduction stays out of route baselines", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "networkidle" });
    await expect(page.locator(".welcome-intro")).toHaveCount(0);
  });

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

    await page.goto("/contact", { waitUntil: "networkidle" });
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

  test("first-visit introduction renders and dismisses", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL });
    const introPage = await context.newPage();
    try {
      await introPage.goto("/about", { waitUntil: "domcontentloaded" });
      await expect(introPage.locator(".welcome-intro--visible")).toBeVisible();
      await introPage.getByRole("button", { name: "Got it" }).click();
      await expect(introPage.locator(".welcome-intro")).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test("default motion renders pixels in every home WebGL layer", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const canvases = page.locator("canvas");
    await expect(canvases).toHaveCount(3);

    for (let index = 0; index < 3; index += 1) {
      const canvas = canvases.nth(index);
      await canvas.scrollIntoViewIfNeeded();
      await expect(canvas).toBeVisible();
      await expect
        .poll(() =>
          canvas.evaluate((element) => {
            const source = element as HTMLCanvasElement;
            const probe = document.createElement("canvas");
            probe.width = Math.max(1, Math.min(320, source.width));
            probe.height = Math.max(1, Math.min(180, source.height));
            const context = probe.getContext("2d");
            if (!context) return 0;
            context.drawImage(source, 0, 0, probe.width, probe.height);
            const pixels = context.getImageData(
              0,
              0,
              probe.width,
              probe.height,
            ).data;
            let painted = 0;
            for (let i = 3; i < pixels.length; i += 4) {
              if (pixels[i] > 0) painted += 1;
            }
            return painted;
          }),
        )
        .toBeGreaterThan(100);
    }
  });

  test("reduced motion creates no WebGL canvases", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("UTC status remains live while masked from screenshots", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(
      page.locator(utcStatusSelector),
    ).toHaveText(/\d{2}:\d{2}:\d{2}Z/);
  });

  test("external embeds carry accessible fallback metadata", async ({ page }) => {
    await page.goto("/now", { waitUntil: "domcontentloaded" });
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
    await page.goto("/contact", { waitUntil: "networkidle" });
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
