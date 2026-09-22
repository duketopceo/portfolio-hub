import Link from "next/link";
import NotFoundPing from "@/components/NotFoundPing";
import WarpFieldLayer from "@/components/WarpFieldLayer";
import { ActionRow, MarginRail, PageShell } from "@/components/design";

export default function NotFound() {
  return (
    <PageShell className="min-h-[70vh] flex items-center justify-center">
      <NotFoundPing />
      <div className="nf-plate">
        <WarpFieldLayer />

        <MarginRail
          className="nf-plate__margin"
          items={[
            "CI — Off-chart record",
            { content: "Unresolved coordinate", className: "hidden sm:inline" },
            "ERR 404",
          ]}
        />

        <div className="nf-plate__body">
          <p className="nf-plate__code" aria-hidden="true">404</p>
          <h1 className="nf-plate__title">Signal lost</h1>
          <p className="nf-plate__desc">
            Requested coordinate falls outside the surveyed field. The body
            may have moved, been reclassified, or never cataloged.
          </p>

          <ActionRow className="nf-plate__actions">
            <Link href="/projects" className="detail-cta">
              Return to registry
            </Link>
            <Link href="/" className="detail-nav-link">
              Survey home
            </Link>
          </ActionRow>
        </div>
      </div>
    </PageShell>
  );
}
