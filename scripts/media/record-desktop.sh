#!/usr/bin/env bash
# Desktop-app recording on Wayland (Hyprland) with wf-recorder, then encode.sh.
# Usage: record-desktop.sh <slug> <out-dir> [--seconds N] [--audio]
# Select the region with slurp when it appears. Ctrl+C stops (or --seconds N).
# Manual and local by design: the capture sees the whole compositor, so work
# through the desktop part of docs/MEDIA.md section 2 before running it.
# Asahi has no VAAPI, so this uses software x264 for the raw capture.
set -euo pipefail

if [ "$#" -lt 2 ]; then
  sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//' >&2
  exit 2
fi
SLUG="$1"; OUT="$2"; shift 2
SECONDS_MAX=""; AUDIO=()
while [ "$#" -gt 0 ]; do
  case "$1" in
    --seconds) SECONDS_MAX="$2"; shift ;;
    --audio) AUDIO=(--audio) ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done
for t in wf-recorder slurp ffmpeg; do
  command -v "$t" >/dev/null || { echo "missing $t" >&2; exit 2; }
done
mkdir -p "$OUT"
RAW="$OUT/$SLUG-raw.mkv"

echo "Checklist: clean HOME or fixture profile, notifications silenced"
echo "(omarchy-toggle-notification-silencing), fixed hostname/prompt, fixture accounts only."
echo "Pick the capture region now."
GEOM="$(slurp)"
echo "Recording starts in 3s."
sleep 3

CMD=(wf-recorder -g "$GEOM" -r 30 -c libx264 -p preset=veryfast -p crf=18 "${AUDIO[@]}" -f "$RAW")
if [ -n "$SECONDS_MAX" ]; then
  timeout -s INT "$SECONDS_MAX" "${CMD[@]}" || [ $? -eq 124 ]
else
  "${CMD[@]}" || true
fi

"$(dirname "$0")/encode.sh" "$RAW" "$SLUG" "$OUT" ${AUDIO:+--audio}
"$(dirname "$0")/contact-sheet.sh" "$OUT/$SLUG-demo.mp4"
echo "Raw capture kept at $RAW; delete it once the contact sheet is reviewed."
