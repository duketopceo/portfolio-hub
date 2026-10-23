import { describe, expect, it } from "vitest";
import {
  dropEmptyMedia,
  normaliseHeadings,
  preferDarkPictures,
  prepareReadmeHtml,
  resolveRepoPath,
  rewriteRelativeUrls,
  rewriteUrl,
  sanitiseReadmeLeaks,
} from "./readme-html";

const ctx = { owner: "duketopceo", repo: "Argus", branch: "main" };
const RAW = "https://raw.githubusercontent.com/duketopceo/Argus/main";

describe("resolveRepoPath", () => {
  it("resolves against the README directory", () => {
    expect(resolveRepoPath("img/a.png", "docs/README.md")).toBe("docs/img/a.png");
    expect(resolveRepoPath("../a.png", "docs/README.md")).toBe("a.png");
    expect(resolveRepoPath("./a.png")).toBe("a.png");
  });
  it("treats a leading slash as repo-root relative", () => {
    expect(resolveRepoPath("/assets/x.svg", "docs/README.md")).toBe("assets/x.svg");
  });
  it("clamps .. at the repo root", () => {
    expect(resolveRepoPath("../../../x.png", "docs/README.md")).toBe("x.png");
  });
});

describe("rewriteUrl", () => {
  it("rewrites relative assets to raw.githubusercontent.com", () => {
    expect(rewriteUrl("docs/assets/hero.png", ctx, "asset")).toBe(`${RAW}/docs/assets/hero.png`);
  });
  it("uses the default branch it is given", () => {
    expect(rewriteUrl("a.png", { ...ctx, branch: "master" }, "asset")).toBe(
      "https://raw.githubusercontent.com/duketopceo/Argus/master/a.png"
    );
  });
  it("leaves absolute, protocol-relative, data and anchor URLs alone", () => {
    for (const u of ["https://x.test/a.png", "//x.test/a.png", "data:image/png;base64,AA", "#top"]) {
      expect(rewriteUrl(u, ctx, "asset")).toBe(u);
    }
  });
  it("returns null for local filesystem paths and empty values", () => {
    expect(rewriteUrl("~/Pictures/a.png", ctx, "asset")).toBeNull();
    expect(rewriteUrl("file:///home/x/a.png", ctx, "asset")).toBeNull();
    expect(rewriteUrl("  ", ctx, "asset")).toBeNull();
  });
  it("encodes spaces once", () => {
    expect(rewriteUrl("docs/my%20pic.png", ctx, "asset")).toBe(`${RAW}/docs/my%20pic.png`);
    expect(rewriteUrl("docs/my pic.png", ctx, "asset")).toBe(`${RAW}/docs/my%20pic.png`);
  });
  it("points relative links at github.com blob URLs and keeps the fragment", () => {
    expect(rewriteUrl("docs/install.md#linux", ctx, "link")).toBe(
      "https://github.com/duketopceo/Argus/blob/main/docs/install.md#linux"
    );
  });
});

describe("rewriteRelativeUrls", () => {
  it("rewrites img src and picture source srcset", () => {
    const html =
      '<picture><source media="(prefers-color-scheme: dark)" srcset="docs/a-dark.svg">' +
      '<img src="/assets/brand/lockup.svg" alt="Argus" width="240"></picture>';
    const out = rewriteRelativeUrls(html, ctx);
    expect(out).toContain(`srcset="${RAW}/docs/a-dark.svg"`);
    expect(out).toContain(`src="${RAW}/assets/brand/lockup.svg"`);
  });
  it("does not touch data-canonical-src or already-absolute camo URLs", () => {
    const html =
      '<img src="https://camo.githubusercontent.com/abc" data-canonical-src="docs/x.png" alt="b">';
    expect(rewriteRelativeUrls(html, ctx)).toBe(html);
  });
  it("drops images that point at local filesystem paths", () => {
    expect(rewriteRelativeUrls('<p><img src="~/Pictures/a.png" alt="x"></p>', ctx)).toBe("<p></p>");
  });
  it("rewrites anchors but leaves in-page and absolute anchors alone", () => {
    const out = rewriteRelativeUrls(
      '<a href="LICENSE">l</a><a href="#install">i</a><a href="https://a.test">a</a>',
      ctx
    );
    expect(out).toContain('href="https://github.com/duketopceo/Argus/blob/main/LICENSE"');
    expect(out).toContain('href="#install"');
    expect(out).toContain('href="https://a.test"');
  });
  it("resolves against a nested README path", () => {
    const out = rewriteRelativeUrls('<img src="a.png" alt="">', { ...ctx, readmePath: "docs/README.md" });
    expect(out).toContain(`${RAW}/docs/a.png`);
  });
});

describe("dropEmptyMedia", () => {
  it("removes a video whose only source is empty", () => {
    expect(dropEmptyMedia('<video controls><source src="" type="video/mp4"></video>')).toBe("");
    expect(dropEmptyMedia("<video controls><source type=\"video/mp4\"></video>")).toBe("");
  });
  it("falls back to the poster image", () => {
    expect(dropEmptyMedia('<video poster="https://x.test/p.png"><source src=""></video>')).toBe(
      '<img src="https://x.test/p.png" alt="">'
    );
  });
  it("keeps a playable video and strips only its empty sources", () => {
    const out = dropEmptyMedia(
      '<video controls><source src="https://x.test/a.mp4"><source src=""></video>'
    );
    expect(out).toBe('<video controls><source src="https://x.test/a.mp4"></video>');
  });
});

describe("normaliseHeadings", () => {
  const readme =
    '<div class="markdown-heading" dir="auto"><h1 class="heading-element">Argus</h1><a class="anchor" href="#argus"></a></div>\n' +
    '<div class="markdown-heading" dir="auto"><h2 class="heading-element">Install</h2></div>';
  it("drops a first H1 that repeats the project name and demotes the rest", () => {
    const out = normaliseHeadings(readme, ["argus"]);
    expect(out).not.toMatch(/<h1/);
    expect(out).not.toContain(">Argus<");
    expect(out).toContain("<h3");
    expect(out).toContain("Install</h3>");
  });
  it("demotes a differently-named H1 so no H1 survives", () => {
    const out = normaliseHeadings('<h1>Resource &amp; Fan</h1><h6>x</h6>', ["omarchy-fan"]);
    expect(out).toBe("<h2>Resource &amp; Fan</h2><h6>x</h6>");
  });
});

describe("sanitiseReadmeLeaks", () => {
  it("removes TODO lines inside a paragraph but keeps the rest", () => {
    const html =
      '<blockquote>\n<p dir="auto">Logo is a proposal.\nTODO: add a Brain UI screenshot captured from <code>x</code>.</p>\n</blockquote>';
    const out = sanitiseReadmeLeaks(html);
    expect(out).not.toMatch(/TODO/);
    expect(out).toContain("Logo is a proposal.");
    expect(out).toContain("</p>");
  });
  it("removes a whole TODO paragraph without leaving stray closing tags", () => {
    const out = sanitiseReadmeLeaks('<p dir="auto">TODO: write docs</p>\n<p>Real</p>');
    expect(out).toBe("<p>Real</p>");
  });
  it("drops sections whose heading mentions placeholders, up to the next peer heading", () => {
    const html = [
      '<div class="markdown-heading"><h2 class="x">Guidelines - NO MORE PLACEHOLDERS</h2></div>',
      '<div class="markdown-heading"><h3 class="x">Empty/Placeholder Files Status</h3></div>',
      "<p>The following files are empty</p>",
      '<div class="markdown-heading"><h2 class="x">Usage</h2></div>',
      "<p>Run it</p>",
    ].join("\n");
    const out = sanitiseReadmeLeaks(html);
    expect(out).not.toMatch(/placeholder/i);
    expect(out).not.toContain("empty");
    expect(out).toContain("Usage");
    expect(out).toContain("Run it");
  });
  it("leaves TODO text inside code blocks alone", () => {
    const html = '<pre class="notranslate"><code>\nTODO: real code comment\n</code></pre>';
    expect(sanitiseReadmeLeaks(html)).toBe(html);
  });
  it("does not remove ordinary mentions of the word todo mid-sentence", () => {
    const html = "<p>A todo app for teams</p>";
    expect(sanitiseReadmeLeaks(html)).toBe(html);
  });
});

describe("prepareReadmeHtml", () => {
  it("applies every step", () => {
    const html =
      '<div class="markdown-heading"><h1 class="h">Argus</h1></div>\n' +
      '<p><img src="docs/a.png" alt="a"></p>\n' +
      "<p>TODO: screenshot</p>\n" +
      '<video><source src=""></video>';
    const out = prepareReadmeHtml(html, { ...ctx, projectNames: ["Argus"] });
    expect(out).not.toMatch(/<h1|TODO|<video/);
    expect(out).toContain(`${RAW}/docs/a.png`);
  });
});

describe("preferDarkPictures", () => {
  it("collapses a picture to its dark variant (site is dark-only)", () => {
    const out = preferDarkPictures(
      '<picture><source media="(prefers-color-scheme: dark)" srcset="https://x/dark.svg"><img src="https://x/light.svg" alt="A" width="240"></picture>'
    );
    expect(out).toBe('<img src="https://x/dark.svg" alt="A" width="240">');
  });
  it("leaves pictures without a dark source alone", () => {
    const html = '<picture><source srcset="a.webp"><img src="a.png"></picture>';
    expect(preferDarkPictures(html)).toBe(html);
  });
});
