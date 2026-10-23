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
