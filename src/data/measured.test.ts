import { describe, expect, it } from "vitest";
import { projectConfigs } from "@/data/projects";

describe("measured proof (KD4, R6)", () => {
  const withMeasured = projectConfigs.filter((p) => p.measured?.length);

  it("records source, date and method for every figure, never dated in the future", () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const p of withMeasured) {
      for (const m of p.measured ?? []) {
        expect(m.source.trim(), `${p.slug} ${m.label} source`).not.toBe("");
        expect(m.method.trim(), `${p.slug} ${m.label} method`).not.toBe("");
        expect(m.measuredOn <= today, `${p.slug} ${m.label} date`).toBe(true);
      }
    }
  });

  it("never prints a key-shaped string or a filesystem path", () => {
    const text = JSON.stringify(withMeasured.map((p) => p.measured));
    expect(text).not.toMatch(/sk-or-|sk-[A-Za-z0-9]{16,}|\/home\/|\/Users\//);
  });
});
