import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DossierEvidence } from "./DossierEvidence";

const item = {
  label: "Pass rate",
  value: "9 of 10",
  source: "orchestral run group positioning-2026-11-10",
  measuredOn: "2026-11-10",
  method: "Ten runs of one orchestrator and worker pairing.",
};

describe("DossierEvidence", () => {
  it("shows each figure with its method, source and date under an #evidence anchor", () => {
    const html = renderToStaticMarkup(<DossierEvidence measured={[item]} />);
    expect(html).toContain('id="evidence"');
    expect(html).toContain("Pass rate");
    expect(html).toContain("9 of 10");
    expect(html).toContain(item.method);
    expect(html).toContain(item.source);
    expect(html).toContain("2026-11-10");
  });

  it("renders nothing without measurements", () => {
    expect(renderToStaticMarkup(<DossierEvidence measured={undefined} />)).toBe("");
    expect(renderToStaticMarkup(<DossierEvidence measured={[]} />)).toBe("");
  });
});
