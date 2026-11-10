// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import ThemeProbe from "./ThemeProbe";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("ThemeProbe", () => {
  let container: HTMLDivElement;
  let root: Root;

  async function mountAt(url: string) {
    window.history.replaceState({}, "", url);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<ThemeProbe />);
    });
  }

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete document.documentElement.dataset.theme;
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("sets data-theme from ?theme=paper on localhost", async () => {
    await mountAt("/?theme=paper");
    expect(document.documentElement.dataset.theme).toBe("paper");
  });

  it("ignores values other than ink and paper", async () => {
    await mountAt("/?theme=neon");
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("does nothing on any other host", async () => {
    vi.spyOn(window, "location", "get").mockReturnValue({
      hostname: "luke-the-duke.com",
      search: "?theme=paper",
    } as Location);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<ThemeProbe />);
    });
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("still works when sessionStorage is blocked", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    await mountAt("/?theme=ink");
    expect(document.documentElement.dataset.theme).toBe("ink");
  });
});
