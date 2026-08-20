"use client";

type ProjectDemoVideoProps = {
  src: string;
  title: string;
};

export default function ProjectDemoVideo({ src, title }: ProjectDemoVideoProps) {
  return (
    <div className="demo-frame">
      <div className="demo-frame__header">
        <div className="demo-frame__header-text">
          <span className="demo-frame__url">Walkthrough recording</span>
          <span className="demo-frame__hint">
            Offline demo — no API keys shown
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
      <video
        controls
        playsInline
        preload="metadata"
        className="w-full"
        style={{
          display: "block",
          maxHeight: "540px",
          background: "var(--color-surface, #0d1117)",
          borderRadius: "0 0 8px 8px",
        }}
      >
        <source src={src} type="video/mp4" />
        <track kind="captions" />
        {title} demo video
      </video>
    </div>
  );
}
