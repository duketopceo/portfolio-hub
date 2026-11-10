#!/usr/bin/env node
// Record the shots against a fixture server and mux the narration into the final MP4.
//
//   node scripts/media/assemble.mjs --dir <work-dir> --base http://127.0.0.1:3190 [--burn-captions] [--width 1280 --height 720]
//
// Needs <dir>/cutlist.json, <dir>/wav/p*.wav, <dir>/<slug>.vtt and the transcript from narrate.mjs.
// Re-sanitizes the VTT and transcript, records each shot for exactly its cut-list window
// (record-web.mjs --beats), trims the recorder lead-in, places each WAV at its cut start
// and writes <dir>/<slug>-explainer.mp4. Nothing is uploaded.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertFileClean } from "./lib/sanitize.mjs";
import { beatsFromWindows } from "./lib/script.mjs";
import { shotWindows } from "./lib/timing.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const flags = new Set(["burn-captions"]);
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith("--")) throw new Error(`unexpected argument: ${a}`);
  const key = a.slice(2);
  args[key] = flags.has(key) ? true : process.argv[++i];
}
if (!args.dir || !args.base) {
  console.error("usage: assemble.mjs --dir work-dir --base http://127.0.0.1:3190 [--burn-captions] [--width 1280 --height 720]");
  process.exit(2);
}
const dir = resolve(args.dir);
const cutList = JSON.parse(readFileSync(join(dir, "cutlist.json"), "utf8"));
const { slug } = cutList;
const vtt = join(dir, `${slug}.vtt`);

// Final assets are checked again here: captions and transcript are what gets published.
assertFileClean(vtt);
assertFileClean(join(dir, `${slug}-transcript.txt`));

const run = (cmd, argv) => {
  const r = spawnSync(cmd, argv, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${cmd} failed (${r.status})`);
};

// 1. Narration track: each WAV delayed to its cut start, padded to the video length.
const wavs = cutList.cuts.map((c) => join(dir, "wav", `p${String(c.index).padStart(2, "0")}.wav`));
const delays = cutList.cuts.map((c, i) => `[${i}:a]adelay=${Math.round(c.start * 1000)}:all=1[a${i}]`);
const mix = cutList.cuts.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${cutList.cuts.length}:normalize=0,apad,atrim=0:${cutList.total}[aout]`;
const narration = join(dir, `${slug}-narration.wav`);
run("ffmpeg", ["-v", "error", "-y", ...wavs.flatMap((w) => ["-i", w]), "-filter_complex", [...delays, mix].join(";"), "-map", "[aout]", narration]);

// 2. Record every shot for exactly its window.
const beatsFile = join(dir, "beats.json");
writeFileSync(beatsFile, JSON.stringify(beatsFromWindows(shotWindows(cutList)), null, 2) + "\n");
run(process.execPath, [join(here, "record-web.mjs"), "--beats", beatsFile, "--base", args.base, "--slug", slug, "--out", dir, ...(args.width ? ["--width", args.width] : []), ...(args.height ? ["--height", args.height] : [])]);
const { leadMs } = JSON.parse(readFileSync(join(dir, `${slug}-timing.json`), "utf8"));

// 3. Trim the lead-in, add audio, optionally burn captions.
const filters = ["format=yuv420p"];
if (args["burn-captions"]) {
  const escaped = vtt.replace(/[\\:']/g, (c) => `\\${c}`);
  filters.unshift(`subtitles='${escaped}':force_style='FontName=DejaVu Sans,FontSize=16,Bold=1,Outline=2,MarginV=28'`);
}
const out = join(dir, `${slug}-explainer.mp4`);
run("ffmpeg", [
  "-v", "error", "-y",
  "-ss", (leadMs / 1000).toFixed(3), "-i", join(dir, `${slug}-demo.mp4`),
  "-i", narration,
  "-map", "0:v", "-map", "1:a", "-t", String(cutList.total),
  "-vf", filters.join(","),
  "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "23", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-shortest", out,
]);
console.log(`assembled: ${out} (${cutList.total}s, lead trimmed ${leadMs} ms)`);
