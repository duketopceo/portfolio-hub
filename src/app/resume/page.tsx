import Link from "next/link";
import { basics } from "@/data/resume";
import { ResumeDocument } from "@/components/ResumeDocument";
import ProjectDemoVideo from "@/components/ProjectDemoVideo";
import { skills, work } from "@/data/resume";

const OPENROUTER_DEMO_VIDEO =
  "https://pub-9e45e5f7be6f4c9989852b4989e83a23.r2.dev/demos/openrouter-demos-walkthrough.mp4";

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
      <section
        className="max-w-2xl mx-auto mb-10 space-y-3"
        aria-labelledby="resume-openrouter-demo"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="resume-openrouter-demo" className="detail-section-label mb-0">
            Featured — OpenRouter Demos
          </h2>
          <Link href="/projects/openrouter" className="detail-nav-link text-sm">
            Full dossier →
          </Link>
        </div>
        <p
          className="cosmic-readable"
          style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}
        >
          Four RouteKit harnesses on OpenRouter — deflection, GTM motion, provider
          bakeoff, and Caesar debate. Offline pytest fixtures; live runs with an API
          key.
        </p>
        <ProjectDemoVideo src={OPENROUTER_DEMO_VIDEO} title="OpenRouter Demos" />
      </section>
      <ResumeDocument />
    </div>
  );
}
