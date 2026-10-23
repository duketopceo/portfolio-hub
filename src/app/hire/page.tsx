import Link from "next/link";
import { toClientProject } from "@/lib/client-project";
import {
  ActionRow,
  PageHeader,
  PageShell,
  SurveyPlate,
  TransmissionClose,
} from "@/components/design";
import { FeaturedWork } from "@/components/hire/FeaturedWork";
import HireBackdrop from "@/components/hire/HireBackdrop";
import { UpstreamSummary } from "@/components/UpstreamContributions";
import { basics } from "@/data/resume";
import { listedProjects } from "@/lib/catalog";
import { HOMEPAGE_FEATURED_SLUGS } from "@/lib/project-completeness";
import { getUpstreamContributions } from "@/lib/upstream";

export const metadata = {
  title: "Hire",
  description: `Hire Luke Kimball — ${basics.label}. Email ${basics.email} or read the web résumé.`,
};

export default async function HirePage() {
  const listed = listedProjects();
  const featured = HOMEPAGE_FEATURED_SLUGS.map((slug) =>
    listed.find((x) => x.slug === slug)
  ).filter((p): p is NonNullable<typeof p> => p !== undefined);
  const upstream = await getUpstreamContributions();
  const { city, region, remote } = basics.location;

  return (
    <PageShell measure="readable">
      <div className="hire-hero">
        <HireBackdrop />
        <PageHeader
          metadata={[
            { content: "CI / Engagement" },
            { content: basics.label, className: "hidden sm:inline" },
            { content: "Sheet 07" },
          ]}
          eyebrow="Transmission"
          title="Engage"
          lede={`${basics.label} · ${city}, ${region}${remote ? " · remote" : ""}`}
        />

        <ActionRow className="hire-page__actions">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="detail-cta"
            data-umami-event="resume-download"
            data-umami-event-format="pdf"
          >
            Résumé (PDF)
          </a>
          <a
            href={`mailto:${basics.email}`}
            className="detail-cta detail-cta--secondary"
            data-umami-event="contact-email"
            data-umami-event-source="hire"
          >
            Email
          </a>
        </ActionRow>
      </div>

      <FeaturedWork projects={featured.map(toClientProject)} />

      <SurveyPlate
        className="hire-page__section"
        metadata={["Upstream", "Contributions"]}
      >
        <div className="hire-page__secondary">
          <UpstreamSummary data={upstream} />
          <p>
            <Link href="/contributions" className="detail-nav-link">
              See all contributions →
            </Link>
          </p>
        </div>
      </SurveyPlate>

      <TransmissionClose
        className="hire-page__section"
        title="Start the engagement"
        actions={
          <>
            <a
              href={`mailto:${basics.email}`}
              className="detail-cta"
              data-umami-event="contact-email"
              data-umami-event-source="hire-close"
            >
              Email {basics.email}
            </a>
            <Link
              href="/resume"
              className="detail-cta detail-cta--secondary"
              data-umami-event="resume-view"
              data-umami-event-from="hire"
            >
              View web résumé
            </Link>
          </>
        }
      >
        Send the role, scope, and decision timeline. The portfolio carries the
        technical evidence; email starts the conversation.
      </TransmissionClose>
    </PageShell>
  );
}
