import { describe, expect, it } from "vitest";
import { isGitHubAppConfigured } from "./github-app";

describe("github-app", () => {
  it("isGitHubAppConfigured is false without env", () => {
    expect(isGitHubAppConfigured()).toBe(false);
  });
});
