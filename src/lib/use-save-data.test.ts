import { afterEach, describe, expect, it, vi } from "vitest";
import { readSaveData } from "./use-save-data";

describe("readSaveData", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is true only when navigator.connection.saveData is set", () => {
    vi.stubGlobal("navigator", { connection: { saveData: true } });
    expect(readSaveData()).toBe(true);
    vi.stubGlobal("navigator", { connection: { saveData: false } });
    expect(readSaveData()).toBe(false);
    vi.stubGlobal("navigator", {});
    expect(readSaveData()).toBe(false);
  });
});
