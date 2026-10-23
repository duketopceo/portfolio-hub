import { describe, expect, it } from "vitest";
import { framePolicy, shouldUseShader } from "./render-capability";

describe("shouldUseShader", () => {
  it("is false for llvmpipe, SwiftShader and generic software renderers", () => {
    expect(
      shouldUseShader(
        "ANGLE (Mesa, llvmpipe (LLVM 19.1.0, 128 bits), OpenGL 4.5)"
      )
    ).toBe(false);
    expect(
      shouldUseShader(
        "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)"
      )
    ).toBe(false);
    expect(shouldUseShader("Microsoft Basic Render Driver (software)")).toBe(
      false
    );
    expect(shouldUseShader("LLVMPIPE")).toBe(false);
  });

  it("is false for the Windows WARP rasteriser", () => {
    expect(shouldUseShader("ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11)")).toBe(false);
  });

  it("is true for a typical GPU renderer string", () => {
    expect(shouldUseShader("Apple M1 Max")).toBe(true);
    expect(
      shouldUseShader(
        "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)"
      )
    ).toBe(true);
  });

  it("is false when the renderer cannot be identified", () => {
    expect(shouldUseShader(null)).toBe(false);
    expect(shouldUseShader("")).toBe(false);
  });
});

describe("framePolicy", () => {
  const dpr: [number, number] = [1, 1.5];
  it.each([
    { inView: true, software: false, expected: { frameloop: "always", dpr, antialias: true, throttle: false } },
    { inView: false, software: false, expected: { frameloop: "never", dpr, antialias: true, throttle: false } },
    { inView: true, software: true, expected: { frameloop: "demand", dpr: 1, antialias: false, throttle: true } },
    { inView: false, software: true, expected: { frameloop: "never", dpr: 1, antialias: false, throttle: false } },
  ])("inView=$inView software=$software", ({ inView, software, expected }) => {
    expect(framePolicy({ inView, software, dpr })).toEqual(expected);
  });
});
