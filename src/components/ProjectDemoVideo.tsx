"use client";

type ProjectDemoVideoProps = {
  src: string;
  poster?: string;
  title: string;
};

export default function ProjectDemoVideo({ src, poster, title }: ProjectDemoVideoProps) {
  return (
    <div className="demo-frame">
      <div className="demo-frame__header">
        <div className="demo-frame__header-text">
          <span className="demo-frame__url">Product film</span>
          <span className="demo-frame__hint">
            Recorded demo — no live credentials shown
          </span>
        </div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="demo-frame__open"
        >
          open ↗
        </a>
      </div>
      {/* No autoplay anywhere: playback is always user-initiated, so
          prefers-reduced-motion is respected by construction. */}
      <video
        controls
        muted
        playsInline
        preload="none"
        poster={poster}
        className="w-full"
        style={{
          display: "block",
          maxHeight: "540px",
          background: "var(--color-surface)",
          borderRadius: "0 0 var(--radius-xl) var(--radius-xl)",
        }}
      >
        <source src={src} type="video/mp4" />
        <track kind="captions" />
        {title} demo video
      </video>
    </div>
  );
}
