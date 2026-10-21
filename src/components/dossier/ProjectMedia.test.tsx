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

  it("an error on one video swaps only that player, the other keeps its player and play button", async () => {
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
    expect(videos).toHaveLength(2);

    await act(async () => {
      videos[0].dispatchEvent(new Event("error"));
    });

    const after = container.querySelectorAll("video");
    expect(after).toHaveLength(1);
    expect(after[0].getAttribute("aria-label")).toBe("Argus demo recording");
    expect(container.querySelector('img[src="https://m/r-poster.jpg"]')).not.toBeNull();
    const play = container.querySelector("button.dossier-media__play");
    expect(play?.getAttribute("data-umami-event")).toBe("media-play");
    expect(play?.getAttribute("data-umami-event-kind")).toBe("demo");
    expect(play?.getAttribute("data-umami-event-slug")).toBe("argus");
  });
});
