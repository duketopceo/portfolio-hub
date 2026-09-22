import Link from "next/link";
import { basics } from "@/data/resume";
import { ResumeDocument } from "@/components/ResumeDocument";
import ProjectDemoVideo from "@/components/ProjectDemoVideo";
import { skills, work } from "@/data/resume";
import { OPENROUTER_DEMO_VIDEO_URL } from "@/data/projects";
import {
  EvidencePanel,
  MediaFrame,
  MetricRow,
  PageShell,
  StatusMark,
} from "@/components/design";

export const metadata = {
  title: "Résumé — Luke Kimball",
  description:
    "Luke Kimball — Applied AI Engineer. OpenRouter-native multi-model routing, agent harnesses, and LLM infrastructure. Web résumé with optional PDF download.",
  alternates: { canonical: `${basics.url}/resume` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: basics.name,
  jobTitle: basics.label,
  description: basics.summary,
  url: basics.url,
  email: `mailto:${basics.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: basics.location.city,
    addressRegion: basics.location.region,
    addressCountry: basics.location.countryCode,
  },
  sameAs: basics.profiles.map((p) => p.url),
  knowsAbout: skills.flatMap((s) => s.keywords),
  worksFor: work.map((w) => ({
    "@type": "Organization",
    name: w.company,
    employee: { "@type": "EmployeeRole", roleName: w.position },
  })),
};

export default function ResumePage() {
  return (
    <PageShell className="resume-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EvidencePanel
        className="mb-10"
        labelledBy="resume-openrouter-demo"
        eyebrow="Featured evidence"
        title={<span id="resume-openrouter-demo">OpenRouter demos</span>}
        trackAs="openrouter-demos"
        description={
          <>
            Four RouteKit harnesses on OpenRouter — deflection, GTM motion,
            provider bakeoff, and Caesar debate. Offline pytest fixtures; live
            runs with an API key.{" "}
            <Link href="/projects/openrouter" className="detail-nav-link">
              Full dossier →
            </Link>
          </>
        }
      >
        <dl>
          <MetricRow label="Harnesses" value="4 RouteKit evaluations" />
          <MetricRow
            label="Mode"
            value="Fixture-backed offline evidence; live inference requires a key"
          />
          <MetricRow
            label="Status"
            value={<StatusMark tone="interactive">Inspectable demo</StatusMark>}
          />
        </dl>
        <MediaFrame>
          <ProjectDemoVideo
            src={OPENROUTER_DEMO_VIDEO_URL}
            title="OpenRouter Demos"
          />
        </MediaFrame>
      </EvidencePanel>
      <ResumeDocument />
    </PageShell>
  );
}
