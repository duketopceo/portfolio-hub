import Link from "next/link";
import {
  PageHeader,
  PageShell,
  SurveyPlate,
  TransmissionClose,
} from "@/components/design";

export const metadata = {
  title: "Hire",
  description:
    "Hire Luke Kimball — applied AI and systems engineering. Email hello@luke-the-duke.com or read the web résumé.",
};

export default function HirePage() {
  return (
    <PageShell measure="readable">
      <PageHeader
        metadata={[
          { content: "CI / Engagement" },
          { content: "Full-time · applied AI", className: "hidden sm:inline" },
          { content: "Sheet 07" },
        ]}
        eyebrow="Transmission"
        title="Engage"
        lede="Open to full-time engineering roles where applied AI, infrastructure, and product-minded operations meet. Public work lives here and on GitHub; private dossiers are available in conversation."
      />

      <TransmissionClose
        title="Start the engagement"
        actions={
          <>
            <a
              href="mailto:hello@luke-the-duke.com"
              className="detail-cta"
              data-umami-event="contact-email"
              data-umami-event-source="hire"
            >
              Email hello@luke-the-duke.com
            </a>
            <Link
              href="/resume"
              className="detail-cta detail-cta--secondary"
              data-umami-event="resume-view"
              data-umami-event-source="hire"
            >
              View web résumé
            </Link>
          </>
        }
      >
        Send the role, scope, and decision timeline. The portfolio carries the
        technical evidence; email starts the conversation.
      </TransmissionClose>

      <SurveyPlate
        className="mt-6"
        metadata={["Secondary routes", "Evidence"]}
      >
        <div className="hire-page__secondary">
          <p>
            Prefer a print copy?{" "}
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="detail-nav-link"
              data-umami-event="resume-download"
              data-umami-event-format="pdf"
            >
              Download PDF ↗
            </a>
          </p>
          <p>
            Demos and case studies:{" "}
            <Link href="/openrouter" className="detail-nav-link">
              OpenRouter applications
            </Link>
            {" · "}
            <Link href="/projects" className="detail-nav-link">
              full catalog
            </Link>
          </p>
        </div>
      </SurveyPlate>
    </PageShell>
  );
}
