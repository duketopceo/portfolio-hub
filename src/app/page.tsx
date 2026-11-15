import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import { leadProjects, rankProjects } from "@/lib/ranking";
import { getSignalActivity } from "@/lib/github-activity";
import { buildSignalSummary } from "@/lib/signal-summary";
import { SignalGlance } from "@/components/SignalGlance";
import FilterBar from "@/components/FilterBar";
import GravityMap from "@/components/GravityMap";
import { toGravityInput } from "@/lib/gravity-map";
import { toClientProject } from "@/lib/client-project";
import { capabilityMeta, isCapabilityId } from "@/data/capability-meta";
import { ActionRow, PageShell, SectionHeading } from "@/components/design";

export const revalidate = 3600;

export default async function Home() {
  const [all, activity] = await Promise.all([
    getEnrichedProjects(),
    getSignalActivity(),
  ]);
  const signal = buildSignalSummary(
    activity.payloads,
    {
      fetchedAt: activity.fetchedAt,
      source: activity.source,
      publicSlugs: activity.publicSlugs,
      totalProjects: activity.totalProjects,
    },
    activity.contributions
  );
  const ranked = rankProjects(all);
  const leads = leadProjects(ranked);

  return (
    <div className="home">
      {/* 1 — landing: the words on the left quarter, the gravity map on the right three quarters */}
      <section className="landing" aria-labelledby="home-title">
        <div className="landing__words">
          <h1 id="home-title" className="landing__name">
            Luke
            <br />
            Kimball
          </h1>
          <p className="landing__lede">
            Applied AI engineer. I build agent runtimes and the platforms they
            run on.
          </p>
          <nav className="landing__leads" aria-label="Lead projects">
            <p className="landing__leads-title">Five lead projects</p>
            <ol>
              {leads.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/projects/${p.slug}`}
                    prefetch={false}
                    data-umami-event="home-lead-link"
                    data-umami-event-slug={p.slug}
                  >
                    {p.displayName}
                  </Link>
                  <span className="landing__lead-group">
                    {isCapabilityId(p.capability) ? capabilityMeta[p.capability].short : ""}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
          <ActionRow className="landing__actions">
            <Link
              href="/resume"
              className="detail-cta"
              data-umami-event="home-cta"
              data-umami-event-target="resume"
            >
              Resume →
            </Link>
            <Link
              href="/hire"
              className="detail-cta detail-cta--secondary"
              data-umami-event="home-cta"
              data-umami-event-target="hire"
            >
              Hire
            </Link>
          </ActionRow>
        </div>
        <div className="landing__map">
          <GravityMap projects={toGravityInput(ranked)} variant="landing" />
        </div>
      </section>

      <PageShell className="home-flow" measure="wide">
        {/* 2 — every project, one card each; a group picked on the map filters this grid */}
        <section className="home-work" aria-labelledby="home-work-heading">
          <SectionHeading
            eyebrow="Work"
            title={<span id="home-work-heading">Every project</span>}
            description="Open a card for the dossier. Pick a group on the map above to filter."
          />
          <FilterBar
            projects={ranked.map(toClientProject)}
            registrySlugs={all.map((p) => p.slug)}
          />
          <Link
            href="/projects"
            className="detail-cta detail-cta--secondary home-work__all"
            data-umami-event="home-cta"
            data-umami-event-target="all-projects"
          >
            Work page, with earlier work →
          </Link>
        </section>

        {/* 3 — compact activity strip */}
        <section
          className="home-transmissions"
          aria-labelledby="home-transmissions-heading"
        >
          <div className="home-section__head">
            <h2 id="home-transmissions-heading">Recent engineering signal</h2>
          </div>
          <SignalGlance summary={signal} />
        </section>

        {/* 4 — closing action */}
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
