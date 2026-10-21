WebVTT caption files served from the site origin, named `<slug>-release.vtt` and `<slug>-demo.vtt`.

Reference one from a catalog entry as `curated.media.<slot>.captions`, for example `/media/captions/kurultai-release.vtt`. Keep captions on this origin: the media host sends no CORS headers, so a cross-origin track would need `crossorigin` on the video, which breaks playback.
