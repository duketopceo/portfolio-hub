#!/usr/bin/env bash
# Re-encode a raw recording (WebM from Playwright, MP4 from VHS, MKV from wf-recorder)
# into the web-ready demo set:
#   <out>/<slug>-demo.mp4          H.264 High, yuv420p, CRF 23, faststart, <=1080p
#   <out>/<slug>-demo-poster.jpg   one frame (default 3s in)
#   <out>/<slug>-demo.vtt          only when --vtt FILE is given (copied unchanged)
# Usage: encode.sh <input> <slug> <out-dir> [--audio] [--fps N] [--poster-at SEC] [--vtt FILE] [--crf N]
# Silent by default (-an). Passing --audio keeps the first audio stream as AAC 96k.
set -euo pipefail

if [ "$#" -lt 3 ]; then
  sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//' >&2
  exit 2
fi
IN="$1"; SLUG="$2"; OUT="$3"; shift 3
AUDIO=0; FPS=30; POSTER_AT=3; VTT=""; CRF=23
while [ "$#" -gt 0 ]; do
  case "$1" in
    --audio) AUDIO=1 ;;
    --fps) FPS="$2"; shift ;;
    --poster-at) POSTER_AT="$2"; shift ;;
    --vtt) VTT="$2"; shift ;;
    --crf) CRF="$2"; shift ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done
case "$SLUG" in *[!a-z0-9-]*|"") echo "slug must be lowercase letters, digits, hyphens: $SLUG" >&2; exit 2 ;; esac
[ -f "$IN" ] || { echo "no such input: $IN" >&2; exit 2; }
command -v ffmpeg >/dev/null || { echo "ffmpeg not found" >&2; exit 2; }
mkdir -p "$OUT"

MP4="$OUT/$SLUG-demo.mp4"
POSTER="$OUT/$SLUG-demo-poster.jpg"
AOPTS=(-an)
[ "$AUDIO" = 1 ] && AOPTS=(-c:a aac -b:a 96k)

ffmpeg -v error -y -i "$IN" \
  -vf "fps=$FPS,scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,format=yuv420p" \
  -c:v libx264 -profile:v high -preset slow -crf "$CRF" -pix_fmt yuv420p \
  "${AOPTS[@]}" -movflags +faststart "$MP4"

# Clamp the poster time to the clip so very short clips still get a frame.
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$MP4")"
AT="$(awk -v d="$DUR" -v p="$POSTER_AT" 'BEGIN{ if (p > d - 0.2) p = d / 2; printf "%.2f", p }')"
ffmpeg -v error -y -ss "$AT" -i "$MP4" -frames:v 1 -q:v 2 "$POSTER"

[ -n "$VTT" ] && cp "$VTT" "$OUT/$SLUG-demo.vtt"

SIZE="$(stat -c %s "$MP4")"
echo "mp4:    $MP4 ($(awk -v s="$SIZE" 'BEGIN{printf "%.2f MB", s/1048576}'), ${DUR%.*}s approx)"
echo "poster: $POSTER (frame at ${AT}s)"
[ -n "$VTT" ] && echo "vtt:    $OUT/$SLUG-demo.vtt"
exit 0
