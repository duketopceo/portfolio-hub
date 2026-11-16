"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ShowcaseCardData } from "@/lib/types";
import { isImageLoop } from "@/lib/showcase";
import { useMediaQuery } from "@/lib/use-media-query";
import ThemedPoster from "./ThemedPoster";

interface ShowcaseMediaProps {
  slug: string;
  name: string;
  capability?: string | null;
  accent: string;
  card?: ShowcaseCardData;
  /**
   * "hover": the loop plays while the host element (the nearest ancestor with
   * `data-showcase-host`) is hovered or holds focus. "auto": plays on mount,
   * with a pause control (the dossier).
   */
  mode: "hover" | "auto";
  className?: string;
}

/**
 * The media slot of a showcase card: a still (static thumbnail, loop poster or
 * the generated poster) with an optional muted loop on top. Under
 * prefers-reduced-motion the loop is never mounted, so only the still shows.
 */
export default function ShowcaseMedia({
  slug,
  name,
  capability,
  accent,
  card,
  mode,
  className,
}: ShowcaseMediaProps) {
  // The server value is "reduced", so the loop only mounts after hydration and never flashes for reduced-motion users.
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const loop = card?.gif;
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stillFailed, setStillFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hover mode: follow the host card's hover and focus.
  useEffect(() => {
    if (mode !== "hover" || !loop || reduceMotion) return;
    const host = rootRef.current?.closest<HTMLElement>("[data-showcase-host]");
    if (!host) return;
    const on = () => setActive(true);
    const off = () => {
      if (!host.matches(":hover") && !host.matches(":focus-within")) setActive(false);
    };
    host.addEventListener("mouseenter", on);
    host.addEventListener("mouseleave", off);
    host.addEventListener("focusin", on);
    host.addEventListener("focusout", off);
    return () => {
      host.removeEventListener("mouseenter", on);
      host.removeEventListener("mouseleave", off);
      host.removeEventListener("focusin", on);
      host.removeEventListener("focusout", off);
    };
  }, [mode, loop, reduceMotion]);

  const playing = mode === "auto" ? !paused : active;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.play().catch(() => {});
    } else {
      v.pause();
      if (mode === "hover") v.currentTime = 0;
    }
  }, [playing, mode, reduceMotion]);

  const stillSrc = loop?.poster ?? card?.thumbnail;
  // A thumbnail that fails to load falls back to the generated poster.
  const still = stillFailed ? undefined : stillSrc;
  const canLoop = Boolean(loop) && !reduceMotion;
  const style = { "--poster-accent": accent } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`showcase-media${className ? ` ${className}` : ""}`}
      data-has-loop={loop ? "true" : "false"}
      data-playing={canLoop && playing ? "true" : "false"}
      style={style}
    >
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="showcase-media__still"
          src={still}
          alt={loop ? "" : (card?.thumbnailAlt ?? name)}
          onError={() => setStillFailed(true)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <ThemedPoster slug={slug} name={name} capability={capability} accent={accent} />
      )}

      {canLoop && loop && isImageLoop(loop.url) && playing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="showcase-media__loop" src={loop.url} alt={loop.alt} decoding="async" />
      )}
      {canLoop && loop && !isImageLoop(loop.url) && (
        <video
          ref={videoRef}
          className="showcase-media__loop"
          src={loop.url}
          poster={loop.poster}
          muted
          loop
          playsInline
          preload={mode === "auto" ? "metadata" : "none"}
          autoPlay={mode === "auto"}
          aria-label={loop.alt}
        />
      )}

      {mode === "auto" && canLoop && (
        <button
          type="button"
          className="showcase-media__toggle"
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "Play loop" : "Pause loop"}
        </button>
      )}
    </div>
  );
}
