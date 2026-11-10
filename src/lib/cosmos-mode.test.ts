import { describe, expect, it } from "vitest";
import { parseCosmosOverride, parseTierPin, pickCosmosMode } from "./cosmos-mode";

const base = { reducedMotion: false, webgl: "gpu", saveData: false } as const;

describe("pickCosmosMode", () => {
  it("is live on a GPU with motion allowed", () => {
    expect(pickCosmosMode(base)).toBe("live");
  });
  it.each([
    ["reduced motion", { ...base, reducedMotion: true }],
    ["no WebGL", { ...base, webgl: "none" as const }],
    ["software rasteriser", { ...base, webgl: "software" as const }],
    ["Save-Data", { ...base, saveData: true }],
    ["2 GB device", { ...base, deviceMemory: 2 }],
  ])("is static for %s", (_n, input) => {
    expect(pickCosmosMode(input)).toBe("static");
  });
  it("override static always wins", () => {
    expect(pickCosmosMode({ ...base, override: "static" })).toBe("static");
  });
  it("override live forces software GL but never beats reduced motion or no WebGL", () => {
    expect(pickCosmosMode({ ...base, webgl: "software", override: "live" })).toBe("live");
    expect(pickCosmosMode({ ...base, reducedMotion: true, override: "live" })).toBe("static");
    expect(pickCosmosMode({ ...base, webgl: "none", override: "live" })).toBe("static");
  });
});

describe("parseCosmosOverride", () => {
  it("accepts live and static only", () => {
    expect(parseCosmosOverride("?cosmos=live")).toBe("live");
    expect(parseCosmosOverride("?a=1&cosmos=static")).toBe("static");
    expect(parseCosmosOverride("?cosmos=bogus")).toBeNull();
    expect(parseCosmosOverride("")).toBeNull();
  });
});

describe("parseTierPin", () => {
  it("is true only for cosmos-tier=pin", () => {
    expect(parseTierPin("?cosmos=live&cosmos-tier=pin")).toBe(true);
    expect(parseTierPin("?cosmos-tier=auto")).toBe(false);
    expect(parseTierPin("")).toBe(false);
  });
});
