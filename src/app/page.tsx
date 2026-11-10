import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import { leadProjects, rankProjects } from "@/lib/ranking";
import { getSignalActivity } from "@/lib/github-activity";
import { buildSignalSummary } from "@/lib/signal-summary";
import { SignalGlance } from "@/components/SignalGlance";
import LeadProjectCard from "@/components/LeadProjectCard";
import CategoryGroups from "@/components/CategoryGroups";
import { ActionRow, PageShell, SectionHeading } from "@/components/design";

export const revalidate = 3600;

/** Projects shown per category group on home; /projects lists them all. */
const HOME_GROUP_LIMIT = 4;

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
      {/* 1 — hero: who, what, one primary and one secondary action */}
      <header className="home-hero">
        <div className="home-hero__inner">
          <h1 id="home-title" className="home-hero__title">
            Luke
            <br />
            Kimball
          </h1>
          <div className="home-hero__copy">
            <p className="home-hero__lede">
              Applied AI engineer. I build agent runtimes and the platforms
              they run on.
            </p>
            <p className="home-hero__tagline">Systems that compound.</p>
            <ActionRow className="home-hero__actions">
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
          </div>
        </div>
      </header>

      <PageShell className="home-flow" measure="wide">
        {/* 2 — the three lead projects */}
        <section className="home-leads" aria-labelledby="home-leads-heading">
          <SectionHeading
            eyebrow="Lead work"
            title={<span id="home-leads-heading">Start here</span>}
          />
          <div className="lead-grid">
            {leads.map((p, i) => (
              <LeadProjectCard key={p.slug} project={p} rank={i + 1} />
            ))}
          </div>
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

        {/* 4 — everything else, ranked, by category */}
        <section className="home-rest" aria-labelledby="home-rest-heading">
          <SectionHeading
            eyebrow="The rest of the work"
            title={<span id="home-rest-heading">More projects</span>}
            description="The top of each category, strongest first."
          />
          <CategoryGroups
            ranked={ranked}
            registrySlugs={all.map((p) => p.slug)}
            limit={HOME_GROUP_LIMIT}
          />
          <Link
            href="/projects"
            className="detail-cta detail-cta--secondary home-rest__all"
            data-umami-event="home-cta"
            data-umami-event-target="all-projects"
          >
            All projects →
          </Link>
        </section>

        {/* 5 — closing action */}
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
