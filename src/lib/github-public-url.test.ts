import { describe, expect, it } from "vitest";
import { publicGithubUrl } from "./github-public-url";

describe("publicGithubUrl", () => {
  it("returns the public GitHub URL for a curated public repo", () => {
    expect(publicGithubUrl(false, "kurultai", "duketopceo")).toBe(
      "https://github.com/duketopceo/kurultai"
    );
  });

  it("returns null for a catalog-private repo", () => {
    expect(publicGithubUrl(true, "khan", "duketopceo")).toBeNull();
  });

  it("returns null when repoName is empty", () => {
    expect(publicGithubUrl(false, "", "duketopceo")).toBeNull();
    expect(publicGithubUrl(false, "   ", "duketopceo")).toBeNull();
  });
});
