// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

const gates = vi.hoisted(() => ({ reducedMotion: false, saveData: false }));

vi.mock("next/dynamic", () => ({
  default: () =>
    function StubCanvas() {
      return <canvas data-testid="warp" />;
    },
}));
vi.mock("@/lib/use-media-query", () => ({
  useMediaQuery: () => gates.reducedMotion,
}));
vi.mock("@/lib/use-save-data", () => ({
  useSaveData: () => gates.saveData,
  readSaveData: () => gates.saveData,
}));

import HireBackdrop from "./HireBackdrop";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("HireBackdrop", () => {
  let container: HTMLDivElement;
  let root: Root;

  // The backdrop mounts after the browser is idle (setTimeout fallback in jsdom).
  async function renderSettled(): Promise<string> {
    await act(async () => {
      root.render(<HireBackdrop />);
    });
    await act(async () => {
      vi.runAllTimers();
    });
    return container.innerHTML;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    gates.reducedMotion = false;
    gates.saveData = false;
    container = document.createElement("div");
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    vi.useRealTimers();
  });

  it("renders an aria-hidden, non-interactive canvas layer when motion is allowed", async () => {
    const html = await renderSettled();
    expect(html).toContain("<canvas");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("hire-backdrop");
  });

  it("renders nothing under reduced motion", async () => {
    gates.reducedMotion = true;
    expect(await renderSettled()).toBe("");
  });

  it("renders nothing when Save-Data is set", async () => {
    gates.saveData = true;
    expect(await renderSettled()).toBe("");
  });
});
