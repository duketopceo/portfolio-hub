import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import {
  getHomepageOrbitProjects,
  getHomepageSecondaryOrbitProjects,
} from "@/lib/project-completeness";
import { getHomepageActivityShowcase } from "@/lib/github-activity";
import { isProjectLive } from "@/lib/deployments";
import SolarSystemNav from "@/components/SolarSystemNav";
import { HomeActivityShowcase } from "@/components/HomeActivityShowcase";
import { HomeCatalogBelt } from "@/components/HomeCatalogBelt";
import { HomeLeadSystems } from "@/components/HomeLeadSystems";
import { MetricRow, PageShell } from "@/components/design";

export const revalidate = 3600;

export default async function Home() {
  const [all, activity] = await Promise.all([
    getEnrichedProjects(),
    getHomepageActivityShowcase(),
  ]);
  const primaryOrbit = getHomepageOrbitProjects(all);
  const secondaryOrbit = getHomepageSecondaryOrbitProjects(all);
  const liveCount = all.filter(isProjectLive).length;
  const categories = new Set(all.map((p) => p.category));
  const lead = primaryOrbit[0];
  const registryIndex = all.map((p) => p.slug);
  const indexOf = (list: typeof all) =>
    list.map((p) => Math.max(registryIndex.indexOf(p.slug), 0));

  return (
    <div>
      {/* ── Master survey sheet — the first viewport is the chart plate ── */}
      <section className="sheet" aria-label="Mission control — orbital survey">
        <div className="sheet__plate corner-ticks">
          {/* Sheet margins — registry marginalia */}
          <div className="sheet__margins" aria-hidden="true">
            <span>CI — ORBITAL REGISTRY</span>
            <span className="hidden sm:inline">PROVO, UT — REMOTE US</span>
            <span className="hidden md:inline">SURVEY 2026.09</span>
            <span>SHEET 01 / 01</span>
          </div>

          <header className="sheet__head">
            <p className="reg-label reg-label--accent sheet__eyebrow">
              Engineering portfolio — Luke Kimball
            </p>
            <h1 className="sheet__title">
              Cosmic
              <br />
              Intelligence
            </h1>
            <p className="sheet__tagline">Systems that compound.</p>
          </header>

          {/* The chart — primary orbit */}
          <div className="sheet__chart">
            <SolarSystemNav
              key={lead?.slug ?? "orbit"}
              projects={primaryOrbit}
              registryIndexOf={indexOf(primaryOrbit)}
            />
          </div>

          {/* Drafting title block — engineering convention, lower right */}
          <dl className="sheet__titleblock" aria-label="Survey summary">
            <MetricRow label="Bodies cataloged" value={all.length} />
            <MetricRow label="Sectors" value={categories.size} />
            <MetricRow
              label="Live surfaces"
              value={<span className="sheet__tb-live">{liveCount}</span>}
            />
            {lead && <MetricRow label="Lead system" value={lead.displayName} />}
          </dl>
        </div>
      </section>

      <PageShell className="home-flow" measure="wide">
        <HomeLeadSystems
          projects={primaryOrbit}
          registryIndexOf={indexOf(primaryOrbit)}
        />

        <section
          className="home-transmissions"
          aria-labelledby="home-transmissions-heading"
        >
          <div className="home-section__head">
            <p className="reg-label reg-label--accent">Transmissions</p>
            <h2 id="home-transmissions-heading">Recent engineering signal</h2>
            <p>
              The public activity digest stays compact, but now sits inside the
              same registry grammar as the rest of the page.
            </p>
          </div>
          <HomeActivityShowcase data={activity} />
        </section>

        {secondaryOrbit.length > 0 && (
          <HomeCatalogBelt
            projects={secondaryOrbit}
            registryIndexOf={indexOf(secondaryOrbit)}
          />
        )}

        <section className="home-close" aria-labelledby="home-close-heading">
          <p className="reg-label reg-label--accent">Next action</p>
          <h2 id="home-close-heading">
            Need the short version, or the operating context?
          </h2>
          <p>
            The résumé gives the compressed timeline; the hire brief explains
            what kind of systems I am best used on.
          </p>
          <div className="home-close__actions">
            <Link href="/resume" className="detail-nav-link">
              Open résumé →
            </Link>
            <Link href="/hire" className="detail-nav-link">
              Open hire brief →
            </Link>
          </div>
        </section>
      </PageShell>
    </div>
  );
}
