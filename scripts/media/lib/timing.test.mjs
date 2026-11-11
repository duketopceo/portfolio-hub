import { describe, expect, it } from "vitest";
import { buildCues, buildCutList, buildTranscript, buildVtt, shotWindows, splitSentences, vttTimestamp } from "./timing.mjs";

const paragraphs = [
  { text: "One. Two sentences here.", seconds: 4, shot: { goto: "/a" } },
  { text: "Second paragraph.", seconds: 2.5, shot: { goto: "/b" } },
  { text: "Third.", seconds: 1.25 },
];
const opts = { gap: 0.5, lead: 1, tail: 2 };

describe("buildCutList", () => {
  it("starts each shot at the summed offset of earlier audio, gaps and lead", () => {
    const { cuts, total } = buildCutList(paragraphs, opts);
    expect(cuts.map((c) => c.start)).toEqual([1, 5.5, 8.5]);
    expect(cuts.map((c) => c.end)).toEqual([5, 8, 9.75]);
    expect(total).toBe(11.75);
  });

  it("keeps shots and text, and rejects a paragraph with no audio", () => {
    expect(buildCutList(paragraphs, opts).cuts[1]).toMatchObject({ index: 2, text: "Second paragraph.", shot: { goto: "/b" } });
    expect(() => buildCutList([{ text: "x", seconds: 0 }])).toThrow(/no audio duration/);
  });
});

describe("shotWindows", () => {
  it("covers the whole video with no gaps: first from 0, last to total", () => {
    const w = shotWindows(buildCutList(paragraphs, opts));
    expect(w.map((x) => [x.from, x.to])).toEqual([[0, 5.5], [5.5, 8.5], [8.5, 11.75]]);
    expect(w.reduce((n, x) => n + x.duration, 0)).toBeCloseTo(11.75, 3);
  });
});

describe("VTT", () => {
  const cutList = buildCutList(paragraphs, opts);

  it("formats timestamps", () => {
    expect(vttTimestamp(3723.456)).toBe("01:02:03.456");
    expect(vttTimestamp(0)).toBe("00:00:00.000");
  });

  it("splits sentences without dropping text", () => {
    expect(splitSentences("One. Two sentences here.")).toEqual(["One.", "Two sentences here."]);
    expect(splitSentences("no punctuation")).toEqual(["no punctuation"]);
  });

  it("emits cues whose text equals the paragraph and whose span equals the audio window", () => {
    const cues = buildCues(cutList);
    for (const cut of cutList.cuts) {
      const mine = cues.filter((c) => c.start >= cut.start && c.end <= cut.end);
      expect(mine.map((c) => c.text).join(" ")).toBe(cut.text);
      expect(mine[0].start).toBe(cut.start);
      expect(mine[mine.length - 1].end).toBe(cut.end);
    }
    for (let i = 1; i < cues.length; i++) expect(cues[i].start).toBeGreaterThanOrEqual(cues[i - 1].end);
  });

  it("renders a valid WEBVTT document", () => {
    const vtt = buildVtt(cutList);
    expect(vtt.startsWith("WEBVTT\n\n1\n00:00:01.000 --> ")).toBe(true);
    expect(vtt).toContain("00:00:05.500 --> 00:00:08.000\nSecond paragraph.");
  });

  it("builds a transcript of paragraphs separated by blank lines", () => {
    expect(buildTranscript(cutList)).toBe("One. Two sentences here.\n\nSecond paragraph.\n\nThird.\n");
  });
});

describe("sentence splitting keeps versions, decimals and domains whole", () => {
  it("does not split inside 3.1.0 or example.com", () => {
    expect(splitSentences("Version 3.1.0 indexes 2000 nodes. Visit example.com today.")).toEqual([
      "Version 3.1.0 indexes 2000 nodes.",
      "Visit example.com today.",
    ]);
  });

  it("splits the proportional boundary at the sentence length ratio", () => {
    const cl = buildCutList([{ text: "Four. Twelve chars.", seconds: 4 }], { lead: 1, gap: 0, tail: 0 });
    const cues = buildCues(cl);
    expect(cues).toHaveLength(2);
    expect(cues[0].end).toBe(cues[1].start);
    expect(cues[0].end).toBeCloseTo(1 + (4 * 5) / 18, 2);
  });
});
