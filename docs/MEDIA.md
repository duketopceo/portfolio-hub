# Demo recordings and media

Every listed project has two media slots on its dossier: `media.release` (the launch film) and `media.demo` (a screen recording of the real product). This page is the repeatable recipe for the demo slot. The scripts live in `scripts/media/`.

A slot has three states in the catalog JSON: a media object (`url`, optional `poster`, `captions`, `transcript`), `"to-record"`, or `"n/a"`. A demo stays `"to-record"` until the recording passes the checklist below and Luke has reviewed it.

## 1. Rule: fixtures only

Record only against demo data or fixtures. A project with no safe demo mode stays `"to-record"`; do not record it against real data and blur later. Private projects get a written showcase and videos made from fixtures only.

## 2. Sanitization checklist

Work through every item before pressing record. Tick them in the review note you send with the contact sheet.

- [ ] Clean `HOME`: record from a fresh directory or a throwaway profile; no `/home/<user>` path in any frame. Terminal tapes hide setup with `Hide` / `Show` and use `cd` into a fixture directory only.
- [ ] Fixed hostname and prompt: `export PS1='$ '`; no hostname, username or git branch in the prompt.
- [ ] Notifications off: `omarchy-toggle-notification-silencing` before any desktop capture.
- [ ] Fixture accounts only: demo users, seeded database, fixture corpus. No real email, handle, org, repo name or customer.
- [ ] No real tokens: unset every `*_API_KEY` / `*_TOKEN` variable for the recording process (`env -i` with an explicit allowlist). Never type or paste a secret on camera.
- [ ] Network isolated: web recordings abort every request to a non-loopback origin; CLI recordings run with no provider key.
- [ ] No private repo, private project or private file name visible. Check browser tabs, bookmarks bar, window titles and terminal scrollback.
- [ ] Fixed clock, locale and timezone (the web recorder freezes the clock and uses UTC / en-US).
- [ ] Contact sheet reviewed frame by frame, plus the caption text if there is a VTT.

## 3. Recipe per surface

All commands run from the portfolio-hub repo root. Keep raw captures and output outside the repo (`~/Downloads/claude/portfolio/demos/` is the review folder).

### Web apps (Playwright)

1. Start the app in its fixture/demo mode on a loopback port. For portfolio-hub: `ACTIVITY_USE_FIXTURES=1 npm run build`, then `ACTIVITY_USE_FIXTURES=1 PORT=3190 node scripts/start-standalone.mjs`.
2. Add a scenario (a list of route and scroll beats) to `SCENARIOS` in `scripts/media/record-web.mjs`.
3. `node scripts/media/record-web.mjs --scenario <name> --base http://127.0.0.1:3190 --slug <slug> --out <dir>`

Playwright records WebM at the viewport size (default 1280x720, deviceScaleFactor 1) at low bitrate, so the script treats it as raw and calls `encode.sh` and `contact-sheet.sh` for you. The script refuses non-loopback bases unless `--allow-remote` is given. Playwright video does not show a cursor; keep beats to navigation and scrolling.

### CLIs and TUIs (VHS)

1. Copy `scripts/media/tapes/orchestral.tape` to `scripts/media/tapes/<slug>.tape`. It sets size, font, theme and a hidden setup block (fixed prompt, no color, fixture-only alias).
2. Build the project's fixture data outside the repo.
3. Run VHS with an empty environment: `cd <scratch> && env -i HOME="$HOME" PATH="$PATH" <fixture vars> vhs --quiet scripts/media/tapes/<slug>.tape`. Needs `vhs`, `ttyd`, `ffmpeg`.
4. `scripts/media/encode.sh <scratch>/<slug>-raw.mp4 <slug> <dir> --fps 24` then `scripts/media/contact-sheet.sh <dir>/<slug>-demo.mp4`.

Prefer `Wait /regex/` over long `Sleep` where output timing varies. Wait for the output of each command to finish before the next beat.

### Desktop apps (wf-recorder, Wayland)

`scripts/media/record-desktop.sh <slug> <dir> [--seconds N] [--audio]` picks a region with `slurp`, records software-x264 (Asahi has no VAAPI), then encodes and builds the contact sheet. This one is manual and local: the capture sees the compositor, so close other windows, silence notifications and use a fixture profile first. Status: wf-recorder, slurp and ffmpeg are installed; the script has not been run end to end.

## 4. Encode targets and naming

| Item | Target |
|---|---|
| Video | `<slug>-demo.mp4`, H.264 High, yuv420p, CRF 23, preset slow, `+faststart`, 1080p maximum |
| Frame rate | 30 fps (24 for terminal tapes) |
| Audio | none by default (`-an`); `--audio` keeps AAC 96k |
| Poster | `<slug>-demo-poster.jpg`, one meaningful frame (default 3s in) |
| Captions | `<slug>-demo.vtt`, optional, served from `public/media/captions/<slug>-demo.vtt` |
| Review sheet | `<slug>-demo-contact.jpg`, 4x4 grid with timestamps; for review only, never uploaded |

`<slug>` is the catalog slug. No AV1 or WebM variants: MP4 H.264 plays everywhere. Keep each file well under 100 MB; screen content usually lands at 1 to 3 Mbps.

## 5. Review and handoff (Luke)

1. Open `<slug>-demo-contact.jpg` and the caption text, and walk the checklist. Reject on any real name, path, token, email or private repo.
2. Upload the MP4 to the media bucket at `demos/<slug>-demo.mp4` with `Content-Type: video/mp4`. Poster upload is optional; the dossier can use the poster from the same path pattern.
3. Confirm range requests work: `curl -sI -H 'Range: bytes=0-1' https://media.luke-the-duke.com/demos/<slug>-demo.mp4` must return `206` and `Accept-Ranges: bytes`.
4. If there are captions, commit the VTT to `public/media/captions/<slug>-demo.vtt`. Captions are served from the site because the media host sends no CORS headers.
5. Set the slot in `src/data/catalog/<slug>.json`:

```json
"media": {
  "release": "...unchanged...",
  "demo": {
    "url": "https://media.luke-the-duke.com/demos/<slug>-demo.mp4",
    "poster": "<poster url or omit>",
    "captions": "/media/captions/<slug>-demo.vtt",
    "transcript": "One or two plain sentences describing what the recording shows.",
    "sanitized": true
  }
}
```

6. Run `npm run lint && npm run test`, open `/projects/<slug>`, and check both players.

`sanitized: true` is set only after step 1.

## 6. Tool availability (checked 2026-10-21, aarch64 Omarchy)

| Tool | Status |
|---|---|
| ffmpeg 9.0.2 (libx264, aac, drawtext, tile) | present, used by every script |
| vhs 0.12.1 and ttyd | present, orchestral tape verified |
| Playwright Chromium | present, record-web verified |
| wf-recorder and slurp | present, record-desktop unverified |

## 7. Narrated explainer pipeline (local voice, free)

For a narrated explainer, one script drives the voice, the shot timing and the captions. Everything runs on this machine; nothing is uploaded. Pipeline: **script -> sanitize -> narrate (Kokoro) -> cut list + VTT + transcript -> record shots against fixtures -> mux**.

### One-time Kokoro install (outside the repo)

Kokoro-82M (Apache-2.0) runs on CPU through PyTorch. The venv and the model weights live outside the repo (`~/.local/share/kokoro`, weights in the Hugging Face cache); never vendor them.

```bash
uv venv --python 3.12 ~/.local/share/kokoro/venv
uv pip install --python ~/.local/share/kokoro/venv/bin/python torch --index-url https://download.pytorch.org/whl/cpu
uv pip install --python ~/.local/share/kokoro/venv/bin/python kokoro soundfile numpy \
  en-core-web-sm@https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl
```

Install torch from the CPU index first: on aarch64 the default PyPI wheel pulls gigabytes of CUDA packages. The spaCy model is installed explicitly because kokoro's own downloader fails inside a `uv` venv. `espeak-ng` must be on the system. `KOKORO_PYTHON` overrides the interpreter path.

### Commands

```bash
# 1. Script: a script.json (see "Script format") kept outside the repo; sanitize it first
node scripts/media/sanitize.mjs ~/Downloads/claude/portfolio-r2/<slug>/<slug>-script.json

# 2. Narrate: sanitizes the script again, one WAV per paragraph, cutlist.json, <slug>.vtt, transcript
nice systemd-run --user --scope -p MemoryMax=24G \
  node scripts/media/narrate.mjs --script <script.json> --dir <work-dir>

# 3. Fixture build + server (docs section 3), then record and mux
ACTIVITY_USE_FIXTURES=1 npm run build && ACTIVITY_USE_FIXTURES=1 PORT=3190 node scripts/start-standalone.mjs
nice systemd-run --user --scope -p MemoryMax=24G \
  node scripts/media/assemble.mjs --dir <work-dir> --base http://127.0.0.1:3190 --burn-captions

# 4. Review gate: sanitize the final captions and transcript, then Luke reviews the contact sheet
node scripts/media/sanitize.mjs <work-dir>/<slug>.vtt <work-dir>/<slug>-transcript.txt
```

`npm run media:sanitize | media:narrate | media:assemble -- <args>` wrap the same scripts. Run one job at a time: the machine's OOM daemon has killed large parallel fan-outs.

### Script format

```json
{
  "slug": "kurultai",
  "voice": "af_heart",
  "paragraphs": [
    { "text": "Narration for shot one.", "shot": { "goto": "/projects/kurultai" } },
    { "text": "Narration for shot two.", "shot": { "scroll": 600 } }
  ]
}
```

A paragraph is a shot. `shot` takes the same `goto` / `scroll` beats as `record-web.mjs`. Write public-facing facts only (catalog entry, public README), 150 to 300 words for 60 to 120 seconds. Keep paths, hostnames and keys out of narration; the sanitizer rejects them.

### How timing works (R9)

- `kokoro_tts.py` writes `p01.wav ...` and reads each file's length.
- `buildCutList` starts paragraph 1 after a 0.6 s lead and each later paragraph at the previous end plus a 0.5 s gap. The video ends 1.0 s after the last paragraph.
- `shotWindows` turns the cut list into shot windows with no gaps; `record-web.mjs --beats` holds each shot for exactly its window, and `assemble.mjs` trims the recorder's page-load lead-in.
- `buildVtt` makes one cue per sentence, splitting each paragraph's window by sentence length, so cue text equals the script and cues start and end with the audio. The transcript is the paragraphs in order.
- The builders are pure functions with tests in `scripts/media/lib/timing.test.mjs`.

### Sanitization (KTD6)

`scripts/media/lib/sanitize.mjs` runs on the script before any audio is made (`narrate.mjs`), on the generated VTT and transcript (`narrate.mjs`), and again on both when `assemble.mjs` starts. It fails (exit 1, finding and line shown, tokens redacted) on:

| Class | Source |
|---|---|
| Private repo `owner/name` and bare names, work orgs, employer domains | `scripts/lib/private-names.mjs`, the same list `npm run check:privacy:built` uses (catalog `private: true` entries plus `src/data/private-denylist.ts`) |
| Mailboxes, phone numbers, loopback links, precise coordinates | `scripts/lib/privacy-patterns.mjs`, the same patterns as `npm run check:privacy` |
| Internal hostnames | `*.local`, `*.internal`, `*.lan`, `*.ts.net`, loopback and private addresses, named machines (`INTERNAL_HOST_NAMES`) |
| Absolute filesystem paths | `/home/...`, `/Users/...`, `/etc/...`, `~/...`, `C:\...` |
| Token-shaped strings | `sk-...`, GitHub tokens, AWS keys, Slack tokens, JWTs, `Bearer ...`, private-key blocks, long hex, long mixed-case strings |

The check is text-only. It does not read frames: the contact sheet review in section 5 stays the gate for what is on screen.

### Voice and cost

Default voice is Kokoro `af_heart`: local, free, Apache-2.0. Paid voice needs Luke's approval for each run (KD4). Amazon Polly Neural is the priced fallback because Speech Marks give word timings; credentials come from omaseal at run time (`omaseal get`, entry named when Luke approves), never from a file, the repo or logs.

Estimates for all 15 videos at about 1,200 characters each (18,000 characters; the Kurultai sample script is 1,174). Polly list prices are from memory of AWS's public rate card and are not re-verified here; confirm before any paid run. Speech Marks requests are billed per character, so word timings double the characters.

| Option | Rate | Audio, 15 videos | With word timings | Approval |
|---|---|---|---|---|
| Kokoro-82M local CPU (default) | $0 | $0.00 | n/a (sentence cues from WAV length) | none |
| Polly Standard | $4.00 / 1M chars | $0.07 | $0.14 | Luke |
| Polly Neural | $16.00 / 1M chars | $0.29 | $0.58 | Luke |
| Polly Generative | $30.00 / 1M chars | $0.54 | $1.08 | Luke |

Local compute cost is machine time: see the measured real-time factor below.

Measured on the Kurultai sample (Asahi M1 Max, 10 cores, CPU only, torch 2.15+cpu, 79.3 s of audio, voice `af_heart`): real-time factor (wall time / audio time, lower is faster) 0.97, 1.31 and 1.44 in three full runs while the machine was saturated by other jobs (load average 13 to 25 on 10 cores), and 0.56 on a single 11 s paragraph at lighter load. Expect an unloaded run near the low end, about 0.5 to 0.6, so a 90 s script narrates in roughly 45 to 55 s. An unloaded full-length run was not obtainable on the day of measurement; re-measure on a quiet machine before planning the batch. More torch threads did not help under load (`kokoro_tts.py --threads N`). The whole pipeline for the sample (narrate, record, mux) took about 4 minutes of wall time under that load.
