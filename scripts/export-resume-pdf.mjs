// Renders a 1-page Letter PDF from src/data/resume.ts using Playwright Chromium.
// Usage:
//   node scripts/export-resume-pdf.mjs                        # writes public/resume.pdf (public contact: hello@luke-the-duke.com, no phone)
//   node scripts/export-resume-pdf.mjs --out <path>           # writes PDF (respects RESUME_EMAIL and RESUME_PHONE env vars)
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const resumeTsPath = join(root, "src/data/resume.ts");

function loadResumeData() {
  const raw = readFileSync(resumeTsPath, "utf8");
  const js = raw
    .replace(/^\/\/.*$/gm, "")
    .replace(/\bexport\s+const\s+/g, "const ");
  const fn = new Function(
    `${js}\nreturn { SITE, resumeRevisionDate, basics, skills, projects, work, education, awards };`,
  );
  return fn();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkifyInlineUrls(escapedText) {
  return escapedText.replace(
    /\b((?:luke-the-duke\.com|github\.com\/duketopceo)(?:\/[A-Za-z0-9_.-]+)?)/g,
    '<a href="https://$1">$1</a>',
  );
}

function displayUrl(url) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function buildHtml(data, { email, phone }) {
  const { basics, skills, projects, work, education } = data;

  const contactParts = [];
  contactParts.push(
    `${escapeHtml(basics.location.city)}, ${escapeHtml(basics.location.region)} (Remote US)`,
  );
  if (phone) contactParts.push(escapeHtml(phone));
  contactParts.push(
    `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`,
  );
  for (const p of basics.profiles) {
    contactParts.push(
      `<a href="${escapeHtml(p.url)}">${escapeHtml(displayUrl(p.url))}</a>`,
    );
  }

  const skillsHtml = skills
    .map(
      (s) =>
        `<li><strong>${escapeHtml(s.name)}:</strong> ${escapeHtml(s.detail)}</li>`,
    )
    .join("\n");

  const projectsHtml = projects
    .map((p) => {
      const bullets = [p.description, ...p.highlights]
        .filter(Boolean)
        .map((h) => `<li>${linkifyInlineUrls(escapeHtml(h))}</li>`)
        .join("");
      const nameHtml = p.url
        ? `<a href="${escapeHtml(p.url)}" class="proj-link">${escapeHtml(p.name)}</a>`
        : escapeHtml(p.name);
      return `
      <div class="proj">
        <div class="proj-head">
          <span class="proj-name">${nameHtml}</span>
          <span class="proj-stack">${escapeHtml(p.stack.join(" · "))}</span>
        </div>
        <ul class="bullets">${bullets}</ul>
      </div>`;
    })
    .join("\n");

  const workHtml = work
    .map((w) => {
      const bullets = w.highlights
        .map((h) => `<li>${escapeHtml(h)}</li>`)
        .join("");
      return `
      <div class="role">
        <div class="role-head">
          <div>
            <span class="role-title">${escapeHtml(w.position)}</span>
            <span class="role-company"> — ${escapeHtml(w.company)}</span>
          </div>
          <span class="role-meta">${escapeHtml(w.startDate)} – ${escapeHtml(w.endDate)} · ${escapeHtml(w.location)}</span>
        </div>
        <ul class="bullets">${bullets}</ul>
      </div>`;
    })
    .join("\n");

  const eduHtml = education
    .map(
      (e) =>
        `<div class="edu-row"><span><strong>${escapeHtml(e.studyType)} in ${escapeHtml(e.area)}</strong> — ${escapeHtml(e.institution)}</span><span class="role-meta">${escapeHtml(e.startDate)} – ${escapeHtml(e.endDate)}</span></div>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(basics.name)} — Resume</title>
<style>
  @page {
    size: Letter;
    margin: 0.28in 0.38in;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #111827;
    background: #ffffff;
    font-size: 7.8pt;
    line-height: 1.22;
    -webkit-font-smoothing: antialiased;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  a {
    color: #1d4ed8;
    text-decoration: none;
  }
  header {
    border-bottom: 1.5px solid #1e3a8a;
    padding-bottom: 4px;
    margin-bottom: 5px;
  }
  .name {
    font-size: 16pt;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: #0f172a;
    line-height: 1.05;
    text-transform: uppercase;
  }
  .headline {
    font-size: 8.4pt;
    font-weight: 700;
    color: #1e293b;
    margin-top: 1.5px;
  }
  .contact {
    font-size: 7.55pt;
    color: #475569;
    margin-top: 1.5px;
  }
  .summary {
    font-size: 7.75pt;
    line-height: 1.22;
    color: #1f2937;
    margin-bottom: 5px;
  }
  section {
    margin-top: 5px;
  }
  .sec-title {
    font-size: 7.8pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #1e40af;
    border-bottom: 0.75px solid #cbd5e1;
    padding-bottom: 1px;
    margin-bottom: 3px;
  }
  .skills-list {
    list-style: disc;
    padding-left: 12px;
  }
  .skills-list li {
    margin-bottom: 1.5px;
    font-size: 7.65pt;
    line-height: 1.2;
  }
  .proj {
    margin-bottom: 3.5px;
  }
  .proj-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }
  .proj-name {
    font-weight: 700;
    font-size: 8.0pt;
    color: #0f172a;
  }
  .proj-link {
    color: #0f172a;
    text-decoration: none;
  }
  .proj-stack {
    font-size: 7.25pt;
    color: #475569;
    white-space: nowrap;
  }
  .bullets {
    list-style: disc;
    padding-left: 12px;
    margin-top: 1px;
  }
  .bullets li {
    font-size: 7.6pt;
    line-height: 1.19;
    color: #1f2937;
    margin-bottom: 1px;
  }
  .role {
    margin-bottom: 3.5px;
  }
  .role-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }
  .role-title {
    font-weight: 700;
    font-size: 7.95pt;
    color: #0f172a;
  }
  .role-company {
    font-weight: 600;
    font-size: 7.85pt;
    color: #334155;
  }
  .role-meta {
    font-size: 7.3pt;
    color: #475569;
    white-space: nowrap;
  }
  .edu-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 7.65pt;
    color: #1f2937;
    margin-bottom: 1px;
  }
</style>
</head>
<body>
  <header>
    <div class="name">${escapeHtml(basics.name)}</div>
    <div class="headline">${escapeHtml(basics.label)} — ${escapeHtml(basics.headline)}</div>
    <div class="contact">${contactParts.join(" &nbsp;·&nbsp; ")}</div>
  </header>

  <p class="summary">${linkifyInlineUrls(escapeHtml(basics.summary))}</p>

  <section>
    <h2 class="sec-title">Technical Stack &amp; Harness Fluency</h2>
    <ul class="skills-list">
      ${skillsHtml}
    </ul>
  </section>

  <section>
    <h2 class="sec-title">Selected Agent Runtime, CLI &amp; OpenRouter Systems</h2>
    ${projectsHtml}
  </section>

  <section>
    <h2 class="sec-title">Professional Experience</h2>
    ${workHtml}
  </section>

  <section>
    <h2 class="sec-title">Education</h2>
    ${eduHtml}
  </section>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  const outPath =
    outIdx > -1
      ? resolve(args[outIdx + 1])
      : join(root, "public/resume.pdf");

  const data = loadResumeData();
  const email = process.env.RESUME_EMAIL || data.basics.email;
  const phone = process.env.RESUME_PHONE || "";

  const html = buildHtml(data, { email, phone });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      preferCSSPageSize: true,
    });
    writeFileSync(outPath, pdfBuffer);
    console.log(`Wrote ${outPath} (${pdfBuffer.length} bytes)`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
