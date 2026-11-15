"use client";

import { useRef, useState, type ReactNode } from "react";
import { mediaAsset, type MediaAsset, type MediaKind, type MediaSlot, type ProjectMedia as ProjectMediaConfig } from "@/lib/types";
import { MediaFrame, PageShell } from "@/components/design";

export type MediaStatus = "idle" | "loading" | "playing" | "error";

const LABEL: Record<MediaKind, string> = {
  release: "release video",
  demo: "demo recording",
};
const UNAVAILABLE: Record<MediaKind, string> = {
  release: "Release video unavailable",
  demo: "Demo recording unavailable",
};

interface ProjectMediaViewProps {
  kind: MediaKind;
  media: MediaAsset;
  title: string;
  slug?: string;
  status: MediaStatus;
  onPlay: () => void;
  onPlaying?: () => void;
  onWaiting?: () => void;
  onError?: () => void;
  videoRef?: React.Ref<HTMLVideoElement>;
  /** Shown in place of the catalog poster until the video plays (the generated poster). */
  fallbackPoster?: ReactNode;
}

export function ProjectMediaView({
  kind,
  media,
  title,
  slug,
  status,
  onPlay,
  onPlaying,
  onWaiting,
  onError,
  videoRef,
  fallbackPoster,
}: ProjectMediaViewProps) {
  const name = `${title} ${LABEL[kind]}`;

  return (
    <MediaFrame
      className={`dossier-media dossier-media--${kind}`}
      caption={media.transcript}
    >
      <div className="dossier-media__stage">
        {fallbackPoster && status !== "playing" && (
          <div className="dossier-media__fallback" aria-hidden="true">
            {fallbackPoster}
          </div>
        )}
        {status === "error" ? (
          fallbackPoster ? null : media.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.poster} alt="" className="dossier-media__poster" />
          ) : (
            <p className="dossier-media__unavailable">
              {UNAVAILABLE[kind]}{" "}
              <a href={media.url} className="dossier-media__link">
                Open the file
              </a>
            </p>
          )
        ) : (
          <>
            <video
              ref={videoRef}
              className="dossier-media__video"
              src={media.url}
              poster={fallbackPoster ? undefined : media.poster}
              preload="none"
              playsInline
              controls={status === "playing"}
              aria-label={name}
              onPlaying={onPlaying}
              onWaiting={onWaiting}
              onError={onError}
            >
              {media.captions && (
                <track
                  kind="captions"
                  src={media.captions}
                  srcLang="en"
                  label="English"
                  default
                />
              )}
            </video>
            {status === "idle" && (
              <button
                type="button"
                className="dossier-media__play"
                aria-label={`Play ${name}`}
                onClick={onPlay}
                data-umami-event="media-play"
                data-umami-event-kind={kind}
                data-umami-event-slug={slug}
              >
                <span aria-hidden>Play</span>
              </button>
            )}
            {status === "loading" && (
              <span className="dossier-media__status" role="status">
                Loading
              </span>
            )}
          </>
        )}
      </div>
    </MediaFrame>
  );
}

/** One media slot. Renders nothing unless the slot holds a video. */
export function ProjectMedia({
  kind,
  slot,
  title,
  slug,
  fallbackPoster,
}: {
  kind: MediaKind;
  slot: MediaSlot;
  title: string;
  slug?: string;
  fallbackPoster?: ReactNode;
}) {
  const [status, setStatus] = useState<MediaStatus>("idle");
  const ref = useRef<HTMLVideoElement>(null);
  const media = mediaAsset(slot);
  if (!media) return null;

  return (
    <ProjectMediaView
      kind={kind}
      media={media}
      title={title}
      slug={slug}
      status={status}
      videoRef={ref}
      fallbackPoster={fallbackPoster}
      onPlay={() => {
        setStatus("loading");
        ref.current?.play().catch(() => setStatus("error"));
      }}
      onPlaying={() => setStatus("playing")}
      onWaiting={() => setStatus((s) => (s === "playing" ? "loading" : s))}
      onError={() => setStatus("error")}
    />
  );
}

/**
 * At most one video block: the release film when there is one, else the demo
 * recording. No section when neither is present. `fallbackPoster` replaces the
 * catalog poster (often black) until the video plays.
 */
export function ProjectMediaSection({
  media,
  title,
  slug,
  fallbackPoster,
}: {
  media: ProjectMediaConfig;
  title: string;
  slug?: string;
  fallbackPoster?: ReactNode;
}) {
  const kind: MediaKind | null = mediaAsset(media.release)
    ? "release"
    : mediaAsset(media.demo)
      ? "demo"
      : null;
  if (!kind) return null;
  return (
    <PageShell id="video" className="dossier-page__demo dossier-page__media">
      <ProjectMedia
        kind={kind}
        slot={media[kind]}
        title={title}
        slug={slug}
        fallbackPoster={fallbackPoster}
      />
    </PageShell>
  );
}
