import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import { getHomepageOrbitProjects } from "@/lib/project-completeness";
import { getHomepageActivityShowcase } from "@/lib/github-activity";
import { toClientActivityPayload } from "@/lib/activity-aggregate";
import { HomeActivityShowcase } from "@/components/HomeActivityShowcase";
import { HomeLeadSystems } from "@/components/HomeLeadSystems";
import { PageShell } from "@/components/design";

export const revalidate = 3600;

export default async function Home() {
  const [all, activity] = await Promise.all([
    getEnrichedProjects(),
    getHomepageActivityShowcase(),
  ]);
  const lead = getHomepageOrbitProjects(all);
  const registryIndex = all.map((p) => p.slug);
  const leadIndex = lead.map((p) => Math.max(registryIndex.indexOf(p.slug), 0));

  return (
    <div>
      {/* 1 — intro, one primary action */}
      <section className="sheet" aria-labelledby="home-title">
        <div className="sheet__plate sheet__plate--intro corner-ticks">
          <header className="sheet__head">
            <p className="reg-label reg-label--accent sheet__eyebrow">
              Engineering portfolio — Luke Kimball
            </p>
            <h1 id="home-title" className="sheet__title">
              Cosmic
              <br />
              Intelligence
            </h1>
            <p className="sheet__tagline">Systems that compound.</p>
          </header>
          <p className="sheet__intro">
            Agent harnesses, knowledge layers, and production platforms —
            built on OpenRouter and real APIs, documented with evidence.
          </p>
          <div className="sheet__cta">
            <Link
              href="/projects"
              className="detail-cta"
              data-umami-event="home-cta"
              data-umami-event-target="work"
            >
              See the work →
            </Link>
          </div>
        </div>
      </section>

      <PageShell className="home-flow" measure="wide">
        {/* 2 — the five lead systems */}
        <HomeLeadSystems projects={lead} registryIndexOf={leadIndex} />

        {/* 3 — compact activity strip */}
        <section
          className="home-transmissions"
          aria-labelledby="home-transmissions-heading"
        >
          <div className="home-section__head">
            <p className="reg-label reg-label--accent">Transmissions</p>
            <h2 id="home-transmissions-heading">Recent engineering signal</h2>
          </div>
          <HomeActivityShowcase data={toClientActivityPayload(activity)} />
        </section>
      </PageShell>
    </div>
  );
}
