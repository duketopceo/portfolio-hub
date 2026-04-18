"use client";

export default function PodcastPage() {
  return (
    <iframe
      src="/podcast/index.html"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        zIndex: 9999,
      }}
      title="Luke the Duke Show — Mission Control"
      allow="autoplay"
    />
  );
}
