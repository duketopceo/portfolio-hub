import {
  MetricRow,
  PageHeader,
  PageShell,
  StatusMark,
  SurveyPlate,
  TransmissionClose,
} from "@/components/design";

export const metadata = {
  title: "Contact",
  description:
    "Contact Luke Kimball — hello@luke-the-duke.com, Provo UT. GitHub and LinkedIn links.",
};

export default function ContactPage() {
  return (
    <PageShell measure="readable">
      <PageHeader
        metadata={[
          { content: "CI / Uplink" },
          { content: "Provo, UT — remote US", className: "hidden sm:inline" },
          { content: <StatusMark tone="live">Routed alias</StatusMark> },
        ]}
        eyebrow="Transmission"
        title="Open channel"
        lede="Email is the hire path. GitHub and LinkedIn are the public work."
      />

      <SurveyPlate metadata={["Contact registry", "Verified route"]}>
        <dl>
          <MetricRow
            label="Email"
            value={
              <a
                href="mailto:hello@luke-the-duke.com"
                className="detail-cta"
                data-umami-event="contact-email"
                data-umami-event-source="contact"
              >
                hello@luke-the-duke.com
              </a>
            }
          />
          <MetricRow label="Location" value="Provo, UT · Remote, US" />
          <MetricRow
            label="GitHub"
            value={
              <a
                href="https://github.com/duketopceo"
                target="_blank"
                rel="noopener noreferrer"
                className="detail-nav-link"
              >
                github.com/duketopceo ↗
              </a>
            }
          />
          <MetricRow
            label="LinkedIn"
            value={
              <a
                href="https://linkedin.com/in/lukekimball2789"
                target="_blank"
                rel="noopener noreferrer"
                className="detail-nav-link"
              >
                linkedin.com/in/lukekimball2789 ↗
              </a>
            }
          />
          <MetricRow
            label="Résumé"
            value={
              <a href="/resume" className="detail-nav-link">
                Web résumé →
              </a>
            }
          />
        </dl>
      </SurveyPlate>

      <TransmissionClose
        title="Best next step"
        actions={
          <a
            href="mailto:hello@luke-the-duke.com"
            className="detail-cta"
            data-umami-event="contact-email"
            data-umami-event-source="contact-cta"
          >
            Start with email
          </a>
        }
      >
        Send the role, the problem to solve, or the project you want to inspect.
        A short note is enough; the dossiers carry the evidence.
      </TransmissionClose>
    </PageShell>
  );
}
