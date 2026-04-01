export default function Loading() {
  return (
    <div className="cosmic-page cosmic-page--shell min-h-[50vh] flex items-center justify-center">
      <div className="cosmic-spinner" role="status" aria-label="Loading">
        <div className="cosmic-spinner__ring" />
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
