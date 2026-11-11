import { describe, expect, it } from "vitest";
import { projectConfigs } from "@/data/projects";
import { isListedProject } from "@/lib/catalog-filter";
import { COSMOS_PALETTE } from "@/lib/palette";
import { CAPABILITY_IDS, capabilityMeta, isCapabilityId } from "./capability-meta";

describe("capability groups", () => {
  it("every listed project has exactly one valid capability", () => {
    for (const p of projectConfigs.filter(isListedProject)) {
      expect(isCapabilityId(p.capability), `${p.slug} capability`).toBe(true);
    }
  });

  it("every group has at least one listed project", () => {
    const listed = projectConfigs.filter(isListedProject);
    for (const id of CAPABILITY_IDS) {
      expect(listed.some((p) => p.capability === id), id).toBe(true);
    }
  });

  it("meta covers the five ids and every color is a palette value", () => {
    expect(Object.keys(capabilityMeta).sort()).toEqual([...CAPABILITY_IDS].sort());
    const palette = new Set<string>(Object.values(COSMOS_PALETTE));
    for (const id of CAPABILITY_IDS) expect(palette.has(capabilityMeta[id].color), id).toBe(true);
  });

  it("an unknown capability is rejected", () => {
    expect(isCapabilityId("finance")).toBe(false);
    expect(isCapabilityId(undefined)).toBe(false);
  });

  it("every sector colour is visible on the black background (>= 3:1) and the five are distinct", () => {
    const lum = (hex: string) => {
      const [r, g, b] = [1, 3, 5]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const bg = "#000000";
    const colors = CAPABILITY_IDS.map((id) => capabilityMeta[id].color.toUpperCase());
    for (const id of CAPABILITY_IDS) {
      const c = capabilityMeta[id].color;
      expect((lum(c) + 0.05) / (lum(bg) + 0.05), `${id} ${c} on black`).toBeGreaterThanOrEqual(3);
    }
    expect(new Set(colors).size).toBe(5);
    expect(capabilityMeta["evals-routing"].color.toUpperCase()).toBe("#FFFFFF");
  });
});
