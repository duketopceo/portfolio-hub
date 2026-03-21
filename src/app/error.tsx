"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error boundary]", error);
  }, [error]);

  return (
    <div className="cosmic-page cosmic-page--shell min-h-[50vh] flex flex-col items-center justify-center text-center gap-4">
      <div>
        <p className="detail-section-label mb-2">Something went wrong</p>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Unexpected error</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "Please try again. If the problem persists, reload the page."}
        </p>
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="detail-cta"
      >
        Try again
      </button>
    </div>
  );
}
