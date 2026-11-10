import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const script = "scripts/check-contrast.mjs";

describe("check-contrast.mjs", () => {
  it("reports ink and paper separately and both pass for body, muted and accent text", () => {
    const out = execFileSync("node", [script], { encoding: "utf8" });
    expect(out).not.toContain("FAIL");
    for (const theme of ["ink", "paper"]) {
      for (const token of ["color-text ", "color-text-muted", "color-text-faint", "color-accent", "color-signal", "color-pop"]) {
        expect(out).toContain(`[${theme}] ${token}`);
      }
    }
  });

  it("fails when one theme block is below 4.5:1 even if the other passes", () => {
    const dir = mkdtempSync(join(tmpdir(), "contrast-"));
    const file = join(dir, "tokens.css");
    writeFileSync(
      file,
      `:root, :root[data-theme="ink"] { --color-bg: #000000; --color-surface: #000000; --color-surface-2: #000000; --color-surface-3: #000000; --color-text: #ffffff; --color-text-muted: #ffffff; --color-text-faint: #ffffff; }
       :root[data-theme="paper"] { --color-bg: #ffffff; --color-surface: #ffffff; --color-surface-2: #ffffff; --color-surface-3: #ffffff; --color-text: #000000; --color-text-muted: #000000; --color-text-faint: #cccccc; }`
    );
    const r = spawnSync("node", [script, "--file", file], { encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stdout).toMatch(/FAIL .*\[paper\] color-text-faint/);
    expect(r.stdout).toMatch(/ok .*\[ink\] color-text /);
  });

  it("fails when a named theme leaves a text token undefined or non-hex", () => {
    const dir = mkdtempSync(join(tmpdir(), "contrast-"));
    const file = join(dir, "tokens.css");
    writeFileSync(
      file,
      `:root { --color-bg: #000000; --color-surface: #000000; --color-surface-2: #000000; --color-surface-3: #000000; --color-text: #ffffff; --color-text-muted: #ffffff; --color-text-faint: #ffffff; }
       :root[data-theme="paper"] { --color-bg: #ffffff; --color-surface: #ffffff; --color-surface-2: #ffffff; --color-surface-3: #ffffff; --color-text: rgb(0, 0, 0); --color-text-muted: #000000; --color-text-faint: #000000; }`
    );
    const r = spawnSync("node", [script, "--file", file], { encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stdout).toMatch(/FAIL .*\[paper\] .*not a #RRGGBB hex/);
  });
});
