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
});
