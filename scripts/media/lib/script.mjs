// Narration script format and validation.
//
//   { "slug": "kurultai", "title": "...", "voice": "af_heart",
//     "paragraphs": [ { "text": "...", "shot": { "goto": "/projects/kurultai", "scroll": 700 } } ] }
//
// One paragraph is one shot: its narration WAV length sets how long the shot holds.
import { readFileSync } from "node:fs";
import { assertClean } from "./sanitize.mjs";

const SLUG = /^[a-z0-9-]+$/;

export function parseScript(raw, source = "script") {
  const data = JSON.parse(raw);
  if (!SLUG.test(data.slug ?? "")) throw new Error(`${source}: slug must be lowercase letters, digits, hyphens`);
  if (!Array.isArray(data.paragraphs) || data.paragraphs.length === 0) throw new Error(`${source}: paragraphs must be a non-empty array`);
  data.paragraphs.forEach((p, i) => {
    if (typeof p.text !== "string" || !p.text.trim()) throw new Error(`${source}: paragraph ${i + 1} has no text`);
    if (p.shot !== undefined && (typeof p.shot !== "object" || p.shot === null)) throw new Error(`${source}: paragraph ${i + 1} shot must be an object`);
  });
  return data;
}

/** Reads, sanitizes the WHOLE file (text, titles and shot urls) before anything is narrated, then parses. */
export function loadSanitizedScript(path) {
  const raw = readFileSync(path, "utf8");
  assertClean(raw, path);
  const script = parseScript(raw, path);
  // JSON escapes decode to different text than the raw file shows; the decoded strings are what is spoken.
  const decoded = [script.title ?? "", ...script.paragraphs.flatMap((p) => [p.text, JSON.stringify(p.shot ?? {})])].join("\n");
  assertClean(decoded, `${path} (decoded)`);
  return script;
}

/** Beats for record-web.mjs --beats: one per shot window, `dur` in ms. */
export function beatsFromWindows(windows) {
  return windows.map((w) => ({ ...(w.shot ?? {}), dur: Math.round(w.duration * 1000) }));
}
