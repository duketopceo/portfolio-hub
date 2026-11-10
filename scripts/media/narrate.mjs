#!/usr/bin/env node
// Narrate a script with Kokoro-82M (local CPU, free) and build the timing files.
//
//   node scripts/media/narrate.mjs --script <script.json> --dir <work-dir> [--voice af_heart] [--speed 1]
//
// 1. sanitize the script (fails before any audio is made),
// 2. synthesize one WAV per paragraph (scripts/media/kokoro_tts.py),
// 3. write <dir>/cutlist.json, <dir>/<slug>.vtt and <dir>/<slug>-transcript.txt from the WAV durations,
// 4. sanitize the generated VTT and transcript.
// Kokoro lives outside the repo: KOKORO_PYTHON or ~/.local/share/kokoro/venv/bin/python.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSanitizedScript } from "./lib/script.mjs";
import { assertClean } from "./lib/sanitize.mjs";
import { buildCutList, buildTranscript, buildVtt } from "./lib/timing.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith("--")) throw new Error(`unexpected argument: ${a}`);
  args[a.slice(2)] = process.argv[++i];
}
if (!args.script || !args.dir) {
  console.error("usage: narrate.mjs --script script.json --dir work-dir [--voice af_heart] [--speed 1.0]");
  process.exit(2);
}

const script = loadSanitizedScript(resolve(args.script));
const dir = resolve(args.dir.replace(/^~(?=\/)/, homedir()));
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "paragraphs.json"), JSON.stringify(script.paragraphs.map((p) => p.text), null, 2) + "\n");

const python = process.env.KOKORO_PYTHON ?? join(homedir(), ".local/share/kokoro/venv/bin/python");
const tts = spawnSync(
  python,
  [join(here, "kokoro_tts.py"), "--in", join(dir, "paragraphs.json"), "--out-dir", join(dir, "wav"), "--voice", args.voice ?? script.voice ?? "af_heart", "--speed", args.speed ?? "1.0"],
  { stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, VIRTUAL_ENV: dirname(dirname(python)) } },
);
if (tts.status !== 0) {
  console.error("Kokoro synthesis failed; see docs/MEDIA.md section 7 for the install.");
  process.exit(tts.status ?? 1);
}

const narration = JSON.parse(readFileSync(join(dir, "wav", "narration.json"), "utf8"));
const cutList = buildCutList(narration.paragraphs.map((p, i) => ({ text: p.text, seconds: p.seconds, shot: script.paragraphs[i].shot })));
const vtt = buildVtt(cutList);
const transcript = buildTranscript(cutList);
assertClean(vtt, "generated VTT");
assertClean(transcript, "generated transcript");

writeFileSync(join(dir, "cutlist.json"), JSON.stringify({ slug: script.slug, ...cutList }, null, 2) + "\n");
writeFileSync(join(dir, `${script.slug}.vtt`), vtt);
writeFileSync(join(dir, `${script.slug}-transcript.txt`), transcript);
console.log(`narrated ${script.slug}: ${narration.audioSeconds}s audio, video ${cutList.total}s, rtf ${narration.rtf}`);
