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
        // The fixed full-viewport starfield would paint over the hero in a
        // full-page capture; hide that decorative layer for baselines only.
        await page.addStyleTag({ content: ".cosmic-bg { display: none !important; }" });
        // The home orbit tour advances focus on a timer; pause it so the
        // baseline always shows the same project.
        const tourButton = page.locator(".poster__tour");
        if (await tourButton.isVisible()) {
          await tourButton.click();
          await page.mouse.move(0, 0);
        }
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

  test("default motion renders pixels in every home WebGL layer", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const canvases = page.locator("canvas");
    await expect(canvases).toHaveCount(2);

    for (let index = 0; index < 2; index += 1) {
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

  // The site-wide starfield (SiteBackground) is one canvas on every route and
  // is not a new effect; the /hire backdrop (R18) is the second.
  test("hire backdrop renders one canvas with motion", async ({ page }) => {
    await page.goto("/hire", { waitUntil: "networkidle" });
    await expect(page.locator(".hire-backdrop canvas")).toHaveCount(1);
    await expect(page.locator("canvas")).toHaveCount(2);
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
    await expect(page.locator("canvas")).toHaveCount(1);
  });

  test("home is a poster: hero, planet map, activity, closing row", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(/Luke\s*Kimball/i);
    await expect(page.locator(".solar-system")).toHaveCount(1);
    await expect(page.locator('.solar-system a[href^="/projects/"]').first()).toBeAttached();
    await expect(page.locator(".home-lead__card")).toHaveCount(0);
    await expect(page.locator(".home-transmissions")).toHaveCount(1);
    await expect(page.locator(".home-close")).toHaveCount(1);
    await expect(page.locator(".home-catalog__item")).toHaveCount(0);
    await expect(page.locator(".sheet__plate")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /See the work/ })).toHaveAttribute(
      "href",
      "/projects",
    );
  });

  test("home hero, actions, and map sit above the fold at 1440x900", async ({
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
    // The map must be mostly on screen, not just its top edge.
    const stage = await page.locator(".solar-system__stage").boundingBox();
    expect(stage).not.toBeNull();
    expect(Math.min(900, stage!.y + stage!.height) - stage!.y).toBeGreaterThan(
      stage!.height * 0.6,
    );
  });

  test("planet markers link to dossiers and arrow keys move the focus card", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const links = page.locator(
      '.solar-system a.planet-node[href^="/projects/"]:visible',
    );
    await expect(links).toHaveCount(5);
    const title = page.locator(".solar-focus-card__title");
    const first = await title.textContent();
    await page.locator('.solar-system a.planet-node[tabindex="0"]:visible').focus();
    await page.keyboard.press("ArrowRight");
    await expect(title).not.toHaveText(first ?? "");
    // DOM focus follows the selection: the focused marker is the card's project.
    await expect(page.locator("a.planet-node:focus")).toHaveAttribute(
      "href",
      (await page.locator(".solar-focus-card").getAttribute("href")) ?? "",
    );
    await expect(page.locator(".solar-focus-card")).toHaveAttribute(
      "href",
      /^\/projects\//,
    );
  });

  test("using the map stops the orbit tour and only Play resumes it", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const tour = page.locator(".poster__tour");
    await expect(tour).toHaveText("Pause tour");
    await page.getByRole("button", { name: "Next project in orbit order" }).click();
    await expect(tour).toHaveText("Play tour");
    await tour.click();
    await expect(tour).toHaveText("Pause tour");
    // Play really resumes: the card advances on its own, with the pointer and
    // focus still on the tour button.
    const title = page.locator(".solar-focus-card__title");
    const before = await title.textContent();
    await expect(title).not.toHaveText(before ?? "", { timeout: 9_000 });
  });

  test("reduced motion keeps the full plate, with no tour or running animation", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(
      page.locator('.solar-plate a.planet-node[href^="/projects/"]'),
    ).toHaveCount(5);
    await expect(page.locator(".solar-plate--hidden")).toHaveCount(0);
    await expect(page.locator(".poster__tour")).toBeHidden();
    const running = await page.evaluate(() =>
      document
        .querySelector(".poster")!
        .getAnimations({ subtree: true })
        .filter((a) => (a as CSSAnimation).animationName)
        .map((a) => (a as CSSAnimation).animationName),
    );
    expect(running).toEqual([]);
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
