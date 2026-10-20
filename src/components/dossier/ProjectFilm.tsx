"use client";

import { useRef, useState } from "react";
import type { ProjectFilm as ProjectFilmConfig } from "@/lib/types";
import { MediaFrame } from "@/components/design";

export type FilmStatus = "idle" | "loading" | "playing" | "error";

interface ProjectFilmViewProps {
  film: ProjectFilmConfig;
  title: string;
  status: FilmStatus;
  onPlay: () => void;
  onPlaying?: () => void;
  onWaiting?: () => void;
  onError?: () => void;
  videoRef?: React.Ref<HTMLVideoElement>;
}

export function ProjectFilmView({
  film,
  title,
  status,
  onPlay,
  onPlaying,
  onWaiting,
  onError,
  videoRef,
}: ProjectFilmViewProps) {
  const caption = film.transcript;

  return (
    <MediaFrame className="dossier-film" caption={caption}>
      <div className="dossier-film__stage">
        {status === "error" ? (
          film.poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={film.poster} alt="" className="dossier-film__poster" />
          )
        ) : (
          <>
            <video
              ref={videoRef}
              className="dossier-film__video"
              src={film.url}
              poster={film.poster}
              preload="none"
              playsInline
              controls={status === "playing"}
              aria-label={`${title} film`}
              onPlaying={onPlaying}
              onWaiting={onWaiting}
              onError={onError}
            />
            {status === "idle" && (
              <button
                type="button"
                className="dossier-film__play"
                aria-label={`Play ${title} film`}
                onClick={onPlay}
              >
                <span aria-hidden>Play</span>
              </button>
            )}
            {status === "loading" && (
              <span className="dossier-film__status" role="status">
                Loading
              </span>
            )}
          </>
        )}
      </div>
    </MediaFrame>
  );
}

/** Dossier launch film. Renders nothing when `film` is absent. */
export function ProjectFilm({
  film,
  title,
}: {
  film?: ProjectFilmConfig;
  title: string;
}) {
  const [status, setStatus] = useState<FilmStatus>("idle");
  const ref = useRef<HTMLVideoElement>(null);
  if (!film) return null;

  return (
    <ProjectFilmView
      film={film}
      title={title}
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
