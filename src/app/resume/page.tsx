import { basics } from "@/data/resume";
import { ResumeDocument } from "@/components/ResumeDocument";
import { skills, work } from "@/data/resume";
import { PageShell } from "@/components/design";

export const metadata = {
  title: "Résumé — Luke Kimball",
  description:
    "Luke Kimball — Applied AI Engineer. Agent runtimes, multi-model routing and the platforms they run on, led by the strongest projects. Web résumé with optional PDF download.",
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
      <ResumeDocument />
    </PageShell>
  );
}
