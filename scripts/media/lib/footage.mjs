// Bring-your-own-footage: map cut-list shot windows onto pre-recorded clips.
//
// A script paragraph's shot may be { "clip": "brain.mp4", "in": 2, "out": 9 } instead of a
// record-web beat. `clip` is a bare file name resolved against the clips directory (the sanitizer
// rejects absolute paths in scripts). `in` and `out` are seconds into the clip.
// No I/O here, so the mapping is unit-tested directly.

const round3 = (n) => Math.round(n * 1000) / 1000;
const BARE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export const isClipShot = (shot) => Boolean(shot && typeof shot === "object" && "clip" in shot);

/** Throws a message naming the paragraph when a clip shot is malformed. */
export function validateClipShot(shot, index) {
  const where = `paragraph ${index}`;
  if (typeof shot.clip !== "string" || !BARE_NAME.test(shot.clip) || shot.clip.includes("..")) {
    throw new Error(`${where}: shot.clip must be a bare file name (letters, digits, . _ -), got ${JSON.stringify(shot.clip)}`);
  }
  for (const key of ["in", "out"]) {
    if (shot[key] !== undefined && !(typeof shot[key] === "number" && Number.isFinite(shot[key]) && shot[key] >= 0)) {
      throw new Error(`${where}: shot.${key} must be a number of seconds >= 0`);
    }
  }
  const from = shot.in ?? 0;
  if (shot.out !== undefined && !(shot.out > from)) throw new Error(`${where}: shot.out (${shot.out}) must be greater than shot.in (${from})`);
}

/**
 * One segment per shot window.
 *  - starts at `in` (default 0);
 *  - plays for the window duration, but never past `out` (default: the end of the clip);
 *  - when the usable span is shorter than the window, the last frame is held for `hold` seconds
 *    so the narration timing never moves.
 * @param {{index: number, duration: number, shot?: object}[]} windows from shotWindows()
 * @param {(clip: string) => number} clipSeconds clip length lookup (ffprobe in the CLI, a stub in tests)
 * @returns {{index: number, clip: string, in: number, play: number, hold: number, duration: number}[]}
 */
export function clipSegments(windows, clipSeconds) {
  return windows.map((w) => {
    if (!isClipShot(w.shot)) throw new Error(`shot ${w.index} has no "clip"; own-footage mode needs a clip on every paragraph`);
    validateClipShot(w.shot, w.index);
    const length = clipSeconds(w.shot.clip);
    const from = w.shot.in ?? 0;
    const until = Math.min(w.shot.out ?? length, length);
    if (!(from < until)) throw new Error(`shot ${w.index}: in (${from}) is not before the end of ${w.shot.clip} (${round3(until)} s)`);
    const span = round3(until - from);
    const play = Math.min(span, w.duration);
    return { index: w.index, clip: w.shot.clip, in: from, play: round3(play), hold: round3(Math.max(0, w.duration - play)), duration: round3(w.duration) };
  });
}

/** ffmpeg filter_complex: trim each clip segment, hold its last frame if short, normalise, concat. */
export function buildVideoFilter(segments, { width, height, fps }) {
  const norm = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black,fps=${fps},setsar=1,format=yuv420p`;
  const parts = segments.map((s, i) => {
    const hold = s.hold > 0 ? `,tpad=stop_mode=clone:stop_duration=${s.hold}` : "";
    return `[${i}:v]trim=start=${s.in}:duration=${s.play},setpts=PTS-STARTPTS${hold},${norm},trim=duration=${s.duration},setpts=PTS-STARTPTS[v${i}]`;
  });
  parts.push(`${segments.map((_, i) => `[v${i}]`).join("")}concat=n=${segments.length}:v=1:a=0[vout]`);
  return parts.join(";");
}
