// Pure builders that turn per-paragraph narration durations into the cut list,
// VTT captions and transcript (KTD6, R9). No I/O, so they are unit-tested directly.

export const DEFAULT_GAP_SECONDS = 0.5;
export const DEFAULT_LEAD_SECONDS = 0.6;
export const DEFAULT_TAIL_SECONDS = 1.0;

const round3 = (n) => Math.round(n * 1000) / 1000;

/**
 * Each paragraph starts at lead + the sum of every earlier paragraph's duration plus gaps.
 * @param {{text: string, seconds: number, shot?: object}[]} paragraphs WAV durations in seconds
 * @returns {{cuts: {index: number, start: number, end: number, duration: number, text: string, shot?: object}[], total: number}}
 */
export function buildCutList(paragraphs, { gap = DEFAULT_GAP_SECONDS, lead = DEFAULT_LEAD_SECONDS, tail = DEFAULT_TAIL_SECONDS } = {}) {
  let cursor = lead;
  const cuts = paragraphs.map((p, i) => {
    if (!(p.seconds > 0)) throw new Error(`paragraph ${i + 1} has no audio duration`);
    const start = round3(cursor);
    const end = round3(cursor + p.seconds);
    cursor = end + gap;
    // A shot holds from its start until the next one begins, so audio gaps stay on the same picture.
    return { index: i + 1, start, end, duration: round3(p.seconds), text: p.text, ...(p.file ? { file: p.file } : {}), ...(p.shot ? { shot: p.shot } : {}) };
  });
  const total = round3((cuts.length ? cuts[cuts.length - 1].end : 0) + tail);
  return { cuts, total };
}

/** Shot windows: shot i runs from its audio start (first shot from 0) to the next start (last shot to total). */
export function shotWindows(cutList) {
  const { cuts, total } = cutList;
  return cuts.map((c, i) => {
    const from = i === 0 ? 0 : c.start;
    const to = i === cuts.length - 1 ? total : cuts[i + 1].start;
    return { index: c.index, from: round3(from), to: round3(to), duration: round3(to - from), shot: c.shot };
  });
}

export function splitSentences(text) {
  // A terminator ends a sentence only before whitespace or the end, so "3.1.0" and "example.com" stay whole.
  const parts = text.match(/(?:[^.!?]|[.!?](?!["')\]]*(?:\s|$)))+(?:[.!?]+["')\]]*(?=\s|$))?/g) ?? [text];
  return parts.map((s) => s.trim()).filter(Boolean);
}

export function vttTimestamp(seconds) {
  const ms = Math.round(seconds * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const r = ms % 1000;
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(h)}:${p(m)}:${p(s)}.${p(r, 3)}`;
}

/**
 * One cue per sentence. A paragraph's window is split in proportion to sentence length,
 * so the first cue starts exactly when the paragraph audio starts and the last ends when it ends.
 */
export function buildCues(cutList) {
  const cues = [];
  for (const cut of cutList.cuts) {
    const sentences = splitSentences(cut.text);
    const chars = sentences.reduce((n, s) => n + s.length, 0);
    let t = cut.start;
    sentences.forEach((sentence, i) => {
      const end = i === sentences.length - 1 ? cut.end : round3(t + (cut.duration * sentence.length) / chars);
      cues.push({ start: round3(t), end, text: sentence });
      t = end;
    });
  }
  return cues;
}

export function buildVtt(cutList) {
  const body = buildCues(cutList)
    .map((c, i) => `${i + 1}\n${vttTimestamp(c.start)} --> ${vttTimestamp(c.end)}\n${c.text}`)
    .join("\n\n");
  return `WEBVTT\n\n${body}\n`;
}

export function buildTranscript(cutList) {
  return cutList.cuts.map((c) => c.text).join("\n\n") + "\n";
}
