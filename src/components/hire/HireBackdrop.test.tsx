import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

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

describe("HireBackdrop", () => {
  beforeEach(() => {
    gates.reducedMotion = false;
    gates.saveData = false;
  });

  it("renders an aria-hidden, non-interactive canvas layer when motion is allowed", () => {
    const html = renderToStaticMarkup(<HireBackdrop />);
    expect(html).toContain("<canvas");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("hire-backdrop");
  });

  it("renders nothing under reduced motion", () => {
    gates.reducedMotion = true;
    expect(renderToStaticMarkup(<HireBackdrop />)).toBe("");
  });

  it("renders nothing when Save-Data is set", () => {
    gates.saveData = true;
    expect(renderToStaticMarkup(<HireBackdrop />)).toBe("");
  });
});
