import type { Page } from "@playwright/test";

/**
 * Stub third-party calls that are unreachable/noise in the local test env:
 * - Umami script + beacon (CORS-fails from 127.0.0.1:3100, floods consoleErrors)
 * Production is untouched — this only exists inside Playwright.
 */
export async function stubThirdParty(page: Page) {
  await page.route("https://analytics.pacehq.io/script.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.umami={track:function(){},identify:function(){}};",
    }),
  );
  await page.route("https://analytics.pacehq.io/api/send", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
}
