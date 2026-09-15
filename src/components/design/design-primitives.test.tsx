import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ActionRow,
  EvidencePanel,
  MarginRail,
  MediaFrame,
  MetricRow,
  PageHeader,
  PageShell,
  SectionHeading,
  StatusMark,
  SurveyPlate,
  TransmissionClose,
} from ".";

describe("design primitives", () => {
  it("renders the shared page shell and one h1 header", () => {
    const html = renderToStaticMarkup(
      <PageShell measure="readable">
        <PageHeader
          metadata={[{ content: "CI / FILE" }, { content: "SHEET 01" }]}
          eyebrow="Transmission"
          title="Open channel"
          lede="One clear contact path."
        />
      </PageShell>,
    );

    expect(html).toContain("ds-page--readable");
    expect(html).toContain("<h1");
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("Open channel");
  });

  it("renders evidence rows as description-list semantics", () => {
    const html = renderToStaticMarkup(
      <EvidencePanel title="Proof" labelledBy="proof-heading">
        <dl>
          <MetricRow label="Owned" value="Architecture and delivery" />
        </dl>
      </EvidencePanel>,
    );

    expect(html).toContain("ds-evidence");
    expect(html).toContain("aria-labelledby=\"proof-heading\"");
    expect(html).toContain("<dt");
    expect(html).toContain("<dd");
  });

  it("exposes status and close semantics without emoji", () => {
    const html = renderToStaticMarkup(
      <TransmissionClose title="Next step" actions={<a href="/contact">Contact</a>}>
        <StatusMark tone="live">Live</StatusMark>
      </TransmissionClose>,
    );

    expect(html).toContain("ds-status-mark--live");
    expect(html).toContain("ds-transmission-close");
    expect(html).toContain("href=\"/contact\"");
  });

  it("renders shared rail, section, media, and action primitives", () => {
    const html = renderToStaticMarkup(
      <SurveyPlate metadata={["Registry", "Evidence"]} raised>
        <SectionHeading eyebrow="Sector" title="Survey" />
        <MediaFrame caption="Telemetry capture">
          <div>Survey chart</div>
        </MediaFrame>
        <ActionRow>
          <button type="button">Open registry</button>
        </ActionRow>
      </SurveyPlate>,
    );

    expect(html).toContain("ds-plate--raised");
    expect(html).toContain("aria-hidden=\"true\"");
    expect(html).toContain("ds-section__title");
    expect(html).toContain("<figure");
    expect(html).toContain("<figcaption");
    expect(html).toContain("ds-action-row");
  });

  it("applies primitive variants and defaults", () => {
    const html = renderToStaticMarkup(
      <>
        <PageShell>Default</PageShell>
        <StatusMark>Default</StatusMark>
        <StatusMark tone="restricted">Restricted</StatusMark>
        <MarginRail items={["CI", { content: "Sheet", className: "hidden" }]} />
      </>,
    );

    expect(html).toContain("ds-page--wide");
    expect(html).toContain("ds-status-mark--interactive");
    expect(html).toContain("ds-status-mark--restricted");
    expect(html).toContain("class=\"hidden\"");
  });
});
