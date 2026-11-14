import { describe, expect, it } from "vitest";
import { buildVideoFilter, clipSegments, isClipShot, validateClipShot } from "./footage.mjs";
import { buildCutList, shotWindows } from "./timing.mjs";
import { parseScript } from "./script.mjs";

const lengths = { "brain.mp4": 20, "short.mp4": 3, "term.mp4": 10 };
const lookup = (clip) => {
  if (!(clip in lengths)) throw new Error(`unknown clip ${clip}`);
  return lengths[clip];
};

// Narration 4 s + 2.5 s + 1.25 s, lead 1, gap 0.5, tail 2 -> windows 0-5.5, 5.5-8.5, 8.5-11.75
const cutList = buildCutList(
  [
    { text: "One.", seconds: 4, shot: { clip: "brain.mp4", in: 2, out: 12 } },
    { text: "Two.", seconds: 2.5, shot: { clip: "short.mp4" } },
    { text: "Three.", seconds: 1.25, shot: { clip: "term.mp4", in: 4 } },
  ],
  { gap: 0.5, lead: 1, tail: 2 },
);
const windows = shotWindows(cutList);

describe("clipSegments", () => {
  it("plays each clip from its in-point for exactly the shot window", () => {
    const [a, , c] = clipSegments(windows, lookup);
    expect(a).toMatchObject({ clip: "brain.mp4", in: 2, play: 5.5, hold: 0, duration: 5.5 });
    expect(c).toMatchObject({ clip: "term.mp4", in: 4, play: 3.25, hold: 0, duration: 3.25 });
  });

  it("holds the last frame when the clip is shorter than the window, so audio sync never moves", () => {
    const seg = clipSegments(windows, lookup)[1];
    expect(seg).toMatchObject({ clip: "short.mp4", in: 0, play: 3, hold: 0, duration: 3 });
    const long = shotWindows(buildCutList([{ text: "x", seconds: 8, shot: { clip: "short.mp4", in: 1 } }], { gap: 0, lead: 0, tail: 0 }));
    expect(clipSegments(long, lookup)[0]).toMatchObject({ play: 2, hold: 6, duration: 8 });
  });

  it("never plays past out, then holds", () => {
    const w = shotWindows(buildCutList([{ text: "x", seconds: 9, shot: { clip: "brain.mp4", in: 2, out: 5 } }], { gap: 0, lead: 0, tail: 0 }));
    expect(clipSegments(w, lookup)[0]).toMatchObject({ in: 2, play: 3, hold: 6 });
  });

  it("window durations sum to the cut list total, so the video length equals the audio length", () => {
    const sum = clipSegments(windows, lookup).reduce((n, s) => n + s.duration, 0);
    expect(Math.round(sum * 1000) / 1000).toBe(cutList.total);
  });

  it("rejects a paragraph without a clip, an in-point past the clip end, and unknown clips", () => {
    expect(() => clipSegments([{ index: 1, duration: 2, shot: { goto: "/x" } }], lookup)).toThrow(/needs a clip/);
    expect(() => clipSegments([{ index: 1, duration: 2, shot: { clip: "short.mp4", in: 3 } }], lookup)).toThrow(/not before the end/);
    expect(() => clipSegments([{ index: 1, duration: 2, shot: { clip: "nope.mp4" } }], lookup)).toThrow(/unknown clip/);
  });
});

describe("validateClipShot", () => {
  it("accepts bare names and rejects paths, traversal and bad numbers", () => {
    expect(() => validateClipShot({ clip: "brain-orbit.mp4", in: 0, out: 4 }, 1)).not.toThrow();
    for (const clip of ["/etc/x.mp4", "../x.mp4", "a/b.mp4", "..", "", 4]) expect(() => validateClipShot({ clip }, 2)).toThrow(/paragraph 2/);
    expect(() => validateClipShot({ clip: "a.mp4", in: -1 }, 1)).toThrow(/shot.in/);
    expect(() => validateClipShot({ clip: "a.mp4", in: 5, out: 5 }, 1)).toThrow(/greater than/);
  });

  it("isClipShot tells clip shots from record-web beats", () => {
    expect(isClipShot({ clip: "a.mp4" })).toBe(true);
    expect(isClipShot({ goto: "/" })).toBe(false);
    expect(isClipShot(undefined)).toBe(false);
  });

  it("parseScript still accepts clip shots", () => {
    const s = parseScript(JSON.stringify({ slug: "k", paragraphs: [{ text: "a", shot: { clip: "a.mp4", in: 1, out: 3 } }] }));
    expect(s.paragraphs[0].shot).toEqual({ clip: "a.mp4", in: 1, out: 3 });
  });
});

describe("buildVideoFilter", () => {
  it("emits one trimmed, normalised branch per segment and a concat", () => {
    const f = buildVideoFilter(clipSegments(windows, lookup), { width: 1920, height: 1080, fps: 30 });
    expect(f.match(/trim=start=/g)).toHaveLength(3);
    expect(f).toContain("[0:v]trim=start=2:duration=5.5");
    expect(f).toContain("concat=n=3:v=1:a=0[vout]");
    expect(f).toContain("scale=1920:1080");
    expect(f).not.toContain("tpad=stop_mode=clone:stop_duration=0");
  });
});
