import { describe, expect, it } from "vitest";
import { scrubEmails } from "./readme-scrub";

describe("scrubEmails", () => {
  it("replaces mailboxes in HTML and markdown, keeps the public contact", () => {
    const html =
      '<p>Mail <a href="mailto:someone@gmail.com">someone@gmail.com</a> or [me](mailto:other.name@example.org) or hello@luke-the-duke.com</p>';
    const out = scrubEmails(html);
    expect(out).not.toMatch(/someone@gmail\.com/);
    expect(out).not.toMatch(/other\.name@example\.org/);
    expect(out).not.toContain("mailto:someone");
    expect(out).toContain("[email removed]");
    expect(out).toContain("hello@luke-the-duke.com");
  });
});
