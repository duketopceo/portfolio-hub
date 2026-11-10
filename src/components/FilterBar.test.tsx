// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { projectConfigs } from "@/data/projects";
import { RANKING_PINS } from "@/data/ranking-pins";
import { toClientProject } from "@/lib/client-project";
import { isListedProject } from "@/lib/catalog-filter";
import { rankProjects } from "@/lib/ranking";
import type { EnrichedProject } from "@/lib/types";
import { CAPABILITY_IDS, capabilityMeta } from "@/data/capability-meta";
import FilterBar from "./FilterBar";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const enriched = projectConfigs.filter(isListedProject).map((p) => ({
  ...p,
  repo: null,
  stars: 0,
  language: null,
  languages: [],
  forks: 0,
  openIssuesCount: 0,
  ciStatus: null,
  lastUpdated: "",
  githubUrl: null,
})) as unknown as EnrichedProject[];
const ranked = rankProjects(enriched).map(toClientProject);

describe("FilterBar", () => {
  let container: HTMLDivElement;
  let root: Root;

  async function mount() {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<FilterBar projects={ranked} registrySlugs={enriched.map((p) => p.slug)} />);
    });
  }

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const pill = (key: string) =>
    container.querySelector<HTMLButtonElement>(`#catalog-filter-${key}`)!;

  it("shows the five leads above category groups in rank order by default", async () => {
    await mount();
    const leads = [...container.querySelectorAll("[data-lead-rank]")];
    expect(leads).toHaveLength(5);
    const slugs = leads.map((l) =>
      l.querySelector("a.lead-card__title, .lead-card__title a")?.getAttribute("href")
    );
    expect(slugs).toEqual(RANKING_PINS.map((s) => `/projects/${s}`));
    expect(container.querySelectorAll(".category-group").length).toBeGreaterThan(1);
    expect(container.textContent).toContain(`${ranked.length} projects shown`);
  });

  it("an active filter hides the lead band and shows a flat ranked list with a count", async () => {
    await mount();
    await act(async () => {
      pill("tooling-infra").click();
    });
    expect(container.querySelector("[data-lead-rank]")).toBeNull();
    expect(container.querySelector(".category-group")).toBeNull();
    const expected = ranked.filter((p) => p.capability === "tooling-infra");
    expect(container.textContent).toContain(`${expected.length} project`);
    const titles = [...container.querySelectorAll(".cosmic-card-title")].map((n) => n.textContent);
    expect(titles).toEqual(expected.map((p) => p.displayName));
    expect(pill("tooling-infra").getAttribute("aria-pressed")).toBe("true");
  });

  it("opens on the group named in ?group= (the home See all links)", async () => {
    window.history.replaceState({}, "", "/projects?group=tooling-infra");
    try {
      await mount();
      expect(pill("tooling-infra").getAttribute("aria-pressed")).toBe("true");
      expect(container.querySelector("[data-lead-rank]")).toBeNull();
    } finally {
      window.history.replaceState({}, "", "/");
    }
  });

  it("ignores the retired ?category= parameter", async () => {
    window.history.replaceState({}, "", "/projects?category=apps");
    try {
      await mount();
      expect(pill("all").getAttribute("aria-pressed")).toBe("true");
    } finally {
      window.history.replaceState({}, "", "/");
    }
  });

  it("offers one pill per capability group with its count", async () => {
    await mount();
    for (const id of CAPABILITY_IDS) {
      const count = ranked.filter((p) => p.capability === id).length;
      expect(pill(id).textContent).toContain(capabilityMeta[id].label);
      expect(pill(id).textContent).toContain(String(count));
    }
  });

  it("shows a message with a clear-filter action when nothing matches", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<FilterBar projects={[]} registrySlugs={[]} />);
    });
    expect(container.textContent).toContain("No projects match this filter.");
    const clear = [...container.querySelectorAll("button")].find((b) => b.textContent === "Clear filter");
    expect(clear).toBeDefined();
  });
});
