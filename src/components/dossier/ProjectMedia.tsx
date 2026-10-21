"use client";

import { useRef, useState } from "react";
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
}: ProjectMediaViewProps) {
  const name = `${title} ${LABEL[kind]}`;

  return (
    <MediaFrame
      className={`dossier-media dossier-media--${kind}`}
      caption={media.transcript}
    >
      <div className="dossier-media__stage">
        {status === "error" ? (
          media.poster ? (
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
              poster={media.poster}
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
}: {
  kind: MediaKind;
  slot: MediaSlot;
  title: string;
  slug?: string;
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

/** Release video then demo recording; no section when neither is present. */
export function ProjectMediaSection({
  media,
  title,
  slug,
}: {
  media: ProjectMediaConfig;
  title: string;
  slug?: string;
}) {
  if (!mediaAsset(media.release) && !mediaAsset(media.demo)) {
    return null;
  }
  return (
    <PageShell className="dossier-page__demo dossier-page__media">
      <ProjectMedia kind="release" slot={media.release} title={title} slug={slug} />
      <ProjectMedia kind="demo" slot={media.demo} title={title} slug={slug} />
    </PageShell>
  );
}
