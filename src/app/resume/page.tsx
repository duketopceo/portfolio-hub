import { basics } from "@/data/resume";
import { ResumeDocument } from "@/components/ResumeDocument";
import { skills, work } from "@/data/resume";

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
  telephone: `+1${basics.phone.replace(/[^0-9]/g, "")}`,
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
    <div className="cosmic-page cosmic-page--shell resume-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ResumeDocument />
    </div>
  );
}
