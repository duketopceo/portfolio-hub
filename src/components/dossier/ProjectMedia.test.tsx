// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { MediaAsset } from "@/lib/types";
import { ProjectMediaSection } from "./ProjectMedia";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const asset: MediaAsset = {
  url: "https://m/r.mp4",
  poster: "https://m/r-poster.jpg",
  transcript: "A plain description.",
};

describe("ProjectMediaSection (live)", () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders at most one video block (release first, else demo) and swaps the player on error", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(
        <ProjectMediaSection
          media={{ release: asset, demo: { ...asset, url: "https://m/d.mp4", poster: undefined } }}
          title="Argus"
          slug="argus"
        />
      );
    });
    const videos = container.querySelectorAll("video");
    expect(videos).toHaveLength(1);
    expect(videos[0].getAttribute("aria-label")).toBe("Argus release video");

    await act(async () => {
      videos[0].dispatchEvent(new Event("error"));
    });

    expect(container.querySelectorAll("video")).toHaveLength(0);
    expect(container.querySelector('img[src="https://m/r-poster.jpg"]')).not.toBeNull();
  });

  it("falls back to the demo recording when there is no release, and uses the fallback poster", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(
        <ProjectMediaSection
          media={{ release: "to-record", demo: asset }}
          title="Argus"
          slug="argus"
          fallbackPoster={<span data-testid="fb">poster</span>}
        />
      );
    });
    const video = container.querySelector("video")!;
    expect(video.getAttribute("aria-label")).toBe("Argus demo recording");
    expect(video.hasAttribute("poster")).toBe(false);
    expect(container.querySelector('[data-testid="fb"]')).not.toBeNull();
    const play = container.querySelector("button.dossier-media__play");
    expect(play?.getAttribute("data-umami-event-kind")).toBe("demo");
  });

  it("turns captions on by default when the asset has a captions track", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(
        <ProjectMediaSection
          media={{ release: { ...asset, captions: "/media/captions/argus-release.vtt" }, demo: "to-record" }}
          title="Argus"
          slug="argus"
        />
      );
    });
    const track = container.querySelector("video track");
    expect(track?.getAttribute("kind")).toBe("captions");
    expect(track?.hasAttribute("default")).toBe(true);
    expect(container.querySelector("#video")).not.toBeNull();
  });
});
