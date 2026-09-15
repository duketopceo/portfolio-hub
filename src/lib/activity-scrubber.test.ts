import { describe, expect, it } from "vitest";
import { scrubActivityText, looksLikeSecret } from "./activity-scrubber";

describe("activity-scrubber", () => {
  it("passes through public repo titles unchanged (truncated)", () => {
    expect(
      scrubActivityText("Add sqlite-vec retrieval path", false, "PR merged")
    ).toBe("Add sqlite-vec retrieval path");
  });

  it("redacts emails in private titles", () => {
    const out = scrubActivityText(
      "Fix login for user@example.com",
      true,
      "PR merged"
    );
    expect(out).toBe("PR merged");
    expect(out).not.toContain("example.com");
  });

  it("redacts ghp_ tokens and fails closed", () => {
    const out = scrubActivityText(
      "Deploy with ghp_abcdefghijklmnopqrstuvwxyz1234567890",
      true,
      "PR merged"
    );
    expect(out).toBe("PR merged");
  });

  it("redacts bartlett identifiers on private repos", () => {
    const out = scrubActivityText(
      "Bartlett customer export pipeline",
      true,
      "PR merged"
    );
    expect(out).toBe("PR merged");
  });

  it("redacts phone numbers on private repos", () => {
    const out = scrubActivityText(
      "Call follow-up at 801-555-0199",
      true,
      "PR merged"
    );
    expect(out).toBe("PR merged");
  });

  it("redacts precise coordinates on private repos", () => {
    for (const title of [
      "Site visit near 12.3456°N 98.7654°W",
      "Site visit near 12.3456, -98.7654",
    ]) {
      expect(scrubActivityText(title, true, "PR merged")).toBe("PR merged");
    }
  });

  it("looksLikeSecret detects bearer tokens", () => {
    expect(looksLikeSecret("Authorization Bearer sk-abc123")).toBe(true);
  });

  it("allows benign private titles", () => {
    expect(
      scrubActivityText("Temporal worker retry policy", true, "PR merged")
    ).toBe("Temporal worker retry policy");
  });
});
