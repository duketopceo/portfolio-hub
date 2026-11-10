#!/usr/bin/env python3
"""Synthesize narration paragraphs with Kokoro-82M (Apache-2.0) on CPU.

Run with the venv python from docs/MEDIA.md (outside the repo):
  ~/.local/share/kokoro/venv/bin/python scripts/media/kokoro_tts.py \
      --in paragraphs.json --out-dir wavs/ [--voice af_heart] [--speed 1.0]

paragraphs.json: ["First paragraph.", "Second paragraph."]
Writes <out-dir>/p01.wav ... and <out-dir>/narration.json:
  { voice, speed, sampleRate, audioSeconds, wallSeconds, rtf,
    paragraphs: [{ index, file, text, seconds }] }
Weights download once to the Hugging Face cache; nothing is vendored in the repo.
"""
import argparse
import json
import sys
import time
from pathlib import Path

SAMPLE_RATE = 24000


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="src", required=True)
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--voice", default="af_heart")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--threads", type=int, default=0, help="torch CPU threads (0 = torch default)")
    args = ap.parse_args()

    paragraphs = json.loads(Path(args.src).read_text(encoding="utf-8"))
    if not isinstance(paragraphs, list) or not all(isinstance(p, str) and p.strip() for p in paragraphs):
        print("input must be a JSON array of non-empty strings", file=sys.stderr)
        return 2

    import numpy as np
    import soundfile as sf
    import torch
    from kokoro import KPipeline

    if args.threads > 0:
        torch.set_num_threads(args.threads)

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    pipeline = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M")
    # Warm up so the measured real-time factor excludes one-off graph setup.
    for _ in pipeline("Warm up.", voice=args.voice, speed=args.speed):
        pass

    entries = []
    audio_total = 0.0
    wall_total = 0.0
    for i, text in enumerate(paragraphs, start=1):
        start = time.perf_counter()
        chunks = [np.asarray(a) for _, _, a in pipeline(text, voice=args.voice, speed=args.speed, split_pattern=None)]
        wall_total += time.perf_counter() - start
        audio = np.concatenate(chunks) if chunks else np.zeros(0, dtype="float32")
        name = f"p{i:02d}.wav"
        sf.write(out / name, audio, SAMPLE_RATE)
        seconds = len(audio) / SAMPLE_RATE
        audio_total += seconds
        entries.append({"index": i, "file": name, "text": text, "seconds": round(seconds, 3)})

    report = {
        "voice": args.voice,
        "speed": args.speed,
        "sampleRate": SAMPLE_RATE,
        "audioSeconds": round(audio_total, 3),
        "wallSeconds": round(wall_total, 3),
        "rtf": round(wall_total / audio_total, 4) if audio_total else None,
        "paragraphs": entries,
    }
    (out / "narration.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("audioSeconds", "wallSeconds", "rtf")}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
