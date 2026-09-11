import Link from "next/link";
import { getEnrichedProjects } from "@/lib/github";
import {
  getHomepageOrbitProjects,
  getHomepageSecondaryOrbitProjects,
} from "@/lib/project-completeness";
import { getHomepageActivityShowcase } from "@/lib/github-activity";
import { isProjectLive } from "@/lib/deployments";
import SolarSystemNav from "@/components/SolarSystemNav";
import SecondaryOrbitRings from "@/components/SecondaryOrbitRings";
import { HomeActivityShowcase } from "@/components/HomeActivityShowcase";

export const revalidate = 3600;

export default async function Home() {
  const all = await getEnrichedProjects();
  const primaryOrbit = getHomepageOrbitProjects(all);
  const secondaryOrbit = getHomepageSecondaryOrbitProjects(all);
  const activity = await getHomepageActivityShowcase();
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
            <span className="hidden sm:inline">40.7608°N — 111.8910°W</span>
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
              variant="primary"
            />
            {secondaryOrbit.length > 0 && (
              <SecondaryOrbitRings
                projects={secondaryOrbit}
                registryIndexOf={indexOf(secondaryOrbit)}
              />
            )}
          </div>

          {/* Drafting title block — engineering convention, lower right */}
          <dl className="sheet__titleblock" aria-label="Survey summary">
            <div className="sheet__tb-row">
              <dt>Bodies cataloged</dt>
              <dd>{all.length}</dd>
            </div>
            <div className="sheet__tb-row">
              <dt>Sectors</dt>
              <dd>{categories.size}</dd>
            </div>
            <div className="sheet__tb-row">
              <dt>Live surfaces</dt>
              <dd className="sheet__tb-live">{liveCount}</dd>
            </div>
            {lead && (
              <div className="sheet__tb-row">
                <dt>Lead system</dt>
                <dd>{lead.displayName}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* ── Transmissions — live activity strip ── */}
      <div className="home-activity-strip">
        <HomeActivityShowcase data={activity} />
      </div>

      <section
        className="cosmic-page home-domain-hint"
        aria-label="Domain map in catalog"
      >
        <Link href="/projects#domain-map" className="detail-nav-link">
          Open sector map →
        </Link>
      </section>
    </div>
  );
}
