import Link from "next/link";
import WarpFieldLayer from "@/components/WarpFieldLayer";

export default function NotFound() {
  return (
    <div className="cosmic-page cosmic-page--shell min-h-[70vh] flex items-center justify-center">
      <div className="nf-plate">
        <WarpFieldLayer />

        <div className="nf-plate__margin" aria-hidden="true">
          <span>CI — Off-chart record</span>
          <span className="hidden sm:inline">Unresolved coordinate</span>
          <span>ERR 404</span>
        </div>

        <div className="nf-plate__body">
          <p className="nf-plate__code" aria-hidden="true">404</p>
          <h1 className="nf-plate__title">Signal lost</h1>
          <p className="nf-plate__desc">
            Requested coordinate falls outside the surveyed field. The body
            may have moved, been reclassified, or never cataloged.
          </p>

          <div className="nf-plate__actions">
            <Link href="/projects" className="detail-cta">
              Return to registry
            </Link>
            <Link href="/" className="detail-nav-link">
              Survey home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
