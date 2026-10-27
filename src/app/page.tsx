import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import { getHomepageOrbitProjects } from "@/lib/project-completeness";
import { getHomepageActivityShowcase } from "@/lib/github-activity";
import { toClientActivityPayload } from "@/lib/activity-aggregate";
import { HomeActivityShowcase } from "@/components/HomeActivityShowcase";
import SolarSystemNav from "@/components/SolarSystemNav";
import { toClientProject } from "@/lib/client-project";
import { ActionRow, PageShell } from "@/components/design";

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
    <div className="home">
      {/* 1 — poster: who, what, one action, and the map as the way in */}
      <SolarSystemNav
        key={lead[0]?.slug ?? "orbit"}
        projects={lead.map(toClientProject)}
        registryIndexOf={leadIndex}
      >
        <h1 id="home-title" className="poster__title">
          Luke
          <br />
          Kimball
        </h1>
        <p className="poster__lede">
          Applied AI engineer. I build agent runtimes and the platforms they
          run on.
        </p>
        <p className="poster__tagline">Systems that compound.</p>
        <ActionRow className="poster__actions">
          <Link
            href="/projects"
            className="detail-cta"
            data-umami-event="home-cta"
            data-umami-event-target="work"
          >
            See the work →
          </Link>
          <Link
            href="/resume"
            className="detail-cta detail-cta--secondary"
            data-umami-event="home-cta"
            data-umami-event-target="resume"
          >
            Resume
          </Link>
        </ActionRow>
      </SolarSystemNav>

      <PageShell className="home-flow" measure="wide">
        {/* 2 — compact activity strip */}
        <section
          className="home-transmissions"
          aria-labelledby="home-transmissions-heading"
        >
          <div className="home-section__head">
            <h2 id="home-transmissions-heading">Recent engineering signal</h2>
          </div>
          <HomeActivityShowcase data={toClientActivityPayload(activity)} />
        </section>

        {/* 3 — closing action */}
        <section className="home-close" aria-label="Next steps">
          <p className="home-close__line">
            Hiring for applied AI or agent infrastructure?
          </p>
          <ActionRow>
            <Link
              href="/hire"
              className="detail-cta"
              data-umami-event="home-cta"
              data-umami-event-target="hire"
            >
              Work with me →
            </Link>
            <Link
              href="/about"
              className="detail-cta detail-cta--secondary"
              data-umami-event="home-cta"
              data-umami-event-target="about"
            >
              About
            </Link>
          </ActionRow>
        </section>
      </PageShell>
    </div>
  );
}
