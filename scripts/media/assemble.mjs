#!/usr/bin/env node
// Record the shots against a fixture server and mux the narration into the final MP4.
//
//   node scripts/media/assemble.mjs --dir <work-dir> --base http://127.0.0.1:3190 [--burn-captions] [--width 1280 --height 720]
//   node scripts/media/assemble.mjs --dir <work-dir> --clips <clips-dir> [--burn-captions] [--loudnorm] [--width 1920 --height 1080]
//
// Needs <dir>/cutlist.json, <dir>/wav/p*.wav, <dir>/<slug>.vtt and the transcript from narrate.mjs.
// Re-sanitizes the VTT and transcript, places each WAV at its cut start and writes
// <dir>/<slug>-explainer.mp4. Nothing is uploaded.
//
// Two footage modes, chosen by the script's shots:
//  - record-web (shots with goto/scroll): records each shot for exactly its cut-list window
//    (record-web.mjs --beats) against --base and trims the recorder lead-in;
//  - own footage (every shot has "clip", plus optional "in"/"out" seconds): cuts pre-recorded
//    files from --clips (default <dir>/clips) to the same windows, holding the last frame of a
//    clip that is shorter than its window. No recorder, no --base. See lib/footage.mjs.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertFileClean } from "./lib/sanitize.mjs";
import { buildVideoFilter, clipSegments, isClipShot } from "./lib/footage.mjs";
import { beatsFromWindows } from "./lib/script.mjs";
import { shotWindows } from "./lib/timing.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const flags = new Set(["burn-captions", "loudnorm"]);
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith("--")) throw new Error(`unexpected argument: ${a}`);
  const key = a.slice(2);
  args[key] = flags.has(key) ? true : process.argv[++i];
}
const usage = "usage: assemble.mjs --dir work-dir (--base http://127.0.0.1:3190 | --clips clips-dir) [--burn-captions] [--loudnorm] [--width 1280 --height 720]";
if (!args.dir) {
  console.error(usage);
  process.exit(2);
}
const dir = resolve(args.dir);
const cutList = JSON.parse(readFileSync(join(dir, "cutlist.json"), "utf8"));
const ownFootage = cutList.cuts.length > 0 && cutList.cuts.every((c) => isClipShot(c.shot));
if (cutList.cuts.some((c) => isClipShot(c.shot)) && !ownFootage) {
  console.error('mixed shots: either every paragraph has a "clip" (own footage) or none does (record-web)');
  process.exit(2);
}
if (!ownFootage && !args.base) {
  console.error(usage);
  process.exit(2);
}
const { slug } = cutList;
if (!/^[a-z0-9-]+$/.test(slug ?? "")) throw new Error("cutlist.json slug must be lowercase letters, digits, hyphens");
const vtt = join(dir, `${slug}.vtt`);

// Final assets are checked again here: captions and transcript are what gets published.
assertFileClean(vtt);
assertFileClean(join(dir, `${slug}-transcript.txt`));

const run = (cmd, argv) => {
  const r = spawnSync(cmd, argv, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${cmd} failed (${r.status})`);
};

// 1. Narration track: each WAV delayed to its cut start, padded to the video length.
const wavs = cutList.cuts.map((c) => join(dir, "wav", c.file));
const delays = cutList.cuts.map((c, i) => `[${i}:a]adelay=${Math.round(c.start * 1000)}:all=1[a${i}]`);
// --loudnorm: single-pass EBU R128 to about -16 LUFS (speech), true peak -1.5 dB.
const norm = args.loudnorm ? ",loudnorm=I=-16:TP=-1.5:LRA=11" : "";
const mix = cutList.cuts.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${cutList.cuts.length}:normalize=0${norm},apad,atrim=0:${cutList.total}[aout]`;
const narration = join(dir, `${slug}-narration.wav`);
run("ffmpeg", ["-v", "error", "-y", ...wavs.flatMap((w) => ["-i", w]), "-filter_complex", [...delays, mix].join(";"), "-map", "[aout]", narration]);

const width = Number(args.width ?? (ownFootage ? 1920 : 1280));
const height = Number(args.height ?? (ownFootage ? 1080 : 720));
const burn = (vf) => {
  if (!args["burn-captions"]) return vf;
  const escaped = vtt.replace(/[\\:']/g, (c) => `\\${c}`);
  return `${vf},subtitles='${escaped}':force_style='FontName=DejaVu Sans,FontSize=16,Bold=1,Outline=2,MarginV=28'`;
};
const out = join(dir, `${slug}-explainer.mp4`);
const encode = ["-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"];

if (ownFootage) {
  // 2. Cut the pre-recorded clips to the shot windows.
  const clipsDir = resolve(args.clips ?? join(dir, "clips"));
  const probe = (clip) => {
    const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", join(clipsDir, clip)], { encoding: "utf8" });
    const seconds = Number.parseFloat(r.stdout);
    if (r.status !== 0 || !(seconds > 0)) throw new Error(`cannot read clip ${clip} in ${clipsDir}`);
    return seconds;
  };
  const segments = clipSegments(shotWindows(cutList), probe);
  writeFileSync(join(dir, "segments.json"), JSON.stringify(segments, null, 2) + "\n");
  const fps = Number(args.fps ?? 30);
  const inputs = segments.flatMap((s) => ["-i", join(clipsDir, s.clip)]);
  const filter = `${buildVideoFilter(segments, { width, height, fps })};[vout]${burn("format=yuv420p")}[vfinal]`;
  run("ffmpeg", ["-v", "error", "-y", ...inputs, "-i", narration, "-filter_complex", filter, "-map", "[vfinal]", "-map", `${segments.length}:a`, "-t", String(cutList.total), ...encode, "-shortest", out]);
  console.log(`assembled: ${out} (${cutList.total}s, ${segments.length} own-footage shots)`);
  process.exit(0);
}

// 2. Record every shot for exactly its window.
const beatsFile = join(dir, "beats.json");
writeFileSync(beatsFile, JSON.stringify(beatsFromWindows(shotWindows(cutList)), null, 2) + "\n");
run(process.execPath, [join(here, "record-web.mjs"), "--beats", beatsFile, "--base", args.base, "--slug", slug, "--out", dir, ...(args.width ? ["--width", args.width] : []), ...(args.height ? ["--height", args.height] : [])]);
const { leadMs } = JSON.parse(readFileSync(join(dir, `${slug}-timing.json`), "utf8"));

// 3. Trim the lead-in, add audio, optionally burn captions.
run("ffmpeg", [
  "-v", "error", "-y",
  "-ss", (leadMs / 1000).toFixed(3), "-i", join(dir, `${slug}-demo.mp4`),
  "-i", narration,
  "-map", "0:v", "-map", "1:a", "-t", String(cutList.total),
  "-vf", burn("format=yuv420p"),
  ...encode, "-shortest", out,
]);
console.log(`assembled: ${out} (${cutList.total}s, lead trimmed ${leadMs} ms)`);
