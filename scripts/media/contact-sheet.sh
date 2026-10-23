#!/usr/bin/env bash
# Grid JPEG of evenly spaced frames from a video, for the sanitization review.
# Usage: contact-sheet.sh <video.mp4> [out.jpg] [cols] [rows]
# Default out: <video basename>-contact.jpg beside the video; default grid 4x4.
# Frame times are burned into each tile so a flagged frame can be located.
set -euo pipefail

if [ "$#" -lt 1 ]; then
  sed -n '2,5p' "$0" | sed 's/^# \{0,1\}//' >&2
  exit 2
fi
IN="$1"
OUT="${2:-${IN%.*}-contact.jpg}"
COLS="${3:-4}"; ROWS="${4:-4}"
[ -f "$IN" ] || { echo "no such input: $IN" >&2; exit 2; }
N=$((COLS * ROWS))
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")"
# One frame per slice of the clip, sampled at the slice midpoint.
RATE="$(awk -v n="$N" -v d="$DUR" 'BEGIN{printf "%.6f", n / d}')"
FONT="$(fc-match -f '%{file}' monospace 2>/dev/null || true)"
STAMP=""
if [ -n "$FONT" ] && [ -f "$FONT" ]; then
  STAMP=",drawtext=fontfile=$FONT:text='%{pts\\:hms}':x=8:y=h-th-8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6"
fi
ffmpeg -v error -y -i "$IN" \
  -vf "fps=$RATE:start_time=$(awk -v n="$N" -v d="$DUR" 'BEGIN{printf "%.3f", d/n/2}'),scale=640:-2${STAMP},tile=${COLS}x${ROWS}:padding=6:margin=6:color=black" \
  -frames:v 1 -q:v 3 "$OUT"
echo "contact sheet: $OUT (${COLS}x${ROWS}, ${N} frames over ${DUR%.*}s)"
