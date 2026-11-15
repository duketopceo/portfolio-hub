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

  it("meta covers the seven ids and every color is a palette value", () => {
    expect(Object.keys(capabilityMeta).sort()).toEqual([...CAPABILITY_IDS].sort());
    const palette = new Set<string>(Object.values(COSMOS_PALETTE));
    for (const id of CAPABILITY_IDS) expect(palette.has(capabilityMeta[id].color), id).toBe(true);
  });

  it("spreads the listed projects evenly: every group holds 4 to 9, none more than twice another", () => {
    const listed = projectConfigs.filter(isListedProject);
    const counts = CAPABILITY_IDS.map((id) => listed.filter((p) => p.capability === id).length);
    for (const [i, n] of counts.entries()) {
      expect(n, CAPABILITY_IDS[i]).toBeGreaterThanOrEqual(4);
      expect(n, CAPABILITY_IDS[i]).toBeLessThanOrEqual(9);
    }
    expect(Math.max(...counts)).toBeLessThanOrEqual(2 * Math.min(...counts));
  });

  it("retired the Products and Tooling & infra dumping grounds", () => {
    expect(isCapabilityId("products")).toBe(false);
    expect(isCapabilityId("tooling-infra")).toBe(false);
  });

  it("gives every group a short phone label", () => {
    for (const id of CAPABILITY_IDS) expect(capabilityMeta[id].short.length, id).toBeLessThanOrEqual(10);
  });

  it("an unknown capability is rejected", () => {
    expect(isCapabilityId("finance")).toBe(false);
    expect(isCapabilityId(undefined)).toBe(false);
  });

  it("groups carry no colour: all seven are the same white, so name and position tell them apart", () => {
    for (const id of CAPABILITY_IDS) expect(capabilityMeta[id].color.toUpperCase(), id).toBe("#FFFFFF");
    expect(CAPABILITY_IDS.length).toBe(7);
  });
});
