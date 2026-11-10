#!/usr/bin/env node
// Fail (exit 1) when a script, caption or transcript names a private repo, internal
// hostname, absolute path or token-shaped string. Usage:
//   node scripts/media/sanitize.mjs <file> [<file>...]
// Rules: scripts/media/lib/sanitize.mjs (private names reuse scripts/lib/private-names.mjs).
import { readFileSync } from "node:fs";
import { findIssues } from "./lib/sanitize.mjs";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: sanitize.mjs <file> [<file>...]");
  process.exit(2);
}
let bad = 0;
for (const file of files) {
  const findings = findIssues(readFileSync(file, "utf8"));
  if (findings.length === 0) {
    console.log(`clean: ${file}`);
    continue;
  }
  bad++;
  console.error(`FAIL: ${file}`);
  for (const f of findings) console.error(`  line ${f.line}: ${f.label} (${f.excerpt})`);
}
process.exit(bad ? 1 : 0);
