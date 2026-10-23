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

/**
 * The CSP's `upgrade-insecure-requests` makes Chromium rewrite same-origin
 * RSC prefetches on the plain-http test server to https, which fails with
 * ERR_SSL_PROTOCOL_ERROR. Drop only that directive from document responses
 * so the console stays a faithful signal; every other directive still
 * applies. Production serves https and never hits this.
 */
export async function dropHttpsUpgradeFromDocuments(page: Page) {
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") return route.fallback();
    const response = await route.fetch();
    const headers = response.headers();
    const csp = headers["content-security-policy"];
    if (csp) {
      headers["content-security-policy"] = csp
        .split(";")
        .filter((part) => part.trim() !== "upgrade-insecure-requests")
        .join(";");
    }
    await route.fulfill({ response, headers });
  });
}
