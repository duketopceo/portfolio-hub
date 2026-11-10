// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { projectConfigs } from "@/data/projects";
import { rankProjects } from "@/lib/ranking";
import { toSphereProjects } from "@/lib/sphere-projects";
import ProjectSphere from "./ProjectSphere";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const projects = toSphereProjects(rankProjects(projectConfigs));

function mockMedia(matchesFor: (q: string) => boolean) {
  window.matchMedia = ((q: string) => ({
    matches: matchesFor(q),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("ProjectSphere motion", () => {
  let root: Root;
  let container: HTMLDivElement;
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  async function mount() {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<ProjectSphere projects={projects} />);
    });
  }

  it("never starts the animation loop under reduced motion", async () => {
    mockMedia((q) => q.includes("prefers-reduced-motion"));
    const raf = vi.spyOn(window, "requestAnimationFrame");
    await mount();
    expect(raf).not.toHaveBeenCalled();
  });

  it("starts the loop when motion is allowed", async () => {
    mockMedia(() => false);
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    await mount();
    expect(raf).toHaveBeenCalled();
  });

  it("shows a dot's name on focus and hides it on blur", async () => {
    mockMedia((q) => q.includes("prefers-reduced-motion"));
    await mount();
    const dot = container.querySelector<SVGAElement>("a.project-sphere__dot")!;
    await act(async () => {
      dot.focus();
    });
    expect(container.querySelector(".project-sphere__label")?.textContent).toBe(projects.find((p) => dot.getAttribute("aria-label")!.startsWith(p.name))!.name);
    await act(async () => {
      dot.blur();
    });
    expect(container.querySelector(".project-sphere__label")).toBeNull();
  });

  it("on touch, a first tap names the dot and does not navigate", async () => {
    mockMedia((q) => q.includes("prefers-reduced-motion") || q.includes("pointer: coarse"));
    await mount();
    const dot = container.querySelector<SVGAElement>("a.project-sphere__dot")!;
    const first = new MouseEvent("click", { bubbles: true, cancelable: true });
    await act(async () => {
      dot.dispatchEvent(first);
    });
    expect(first.defaultPrevented).toBe(true);
    expect(container.querySelector(".project-sphere__label")).not.toBeNull();
  });
});
