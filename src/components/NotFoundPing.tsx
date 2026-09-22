"use client";

import { useEffect } from "react";

/** Fires a `not-found` Umami event once per 404 render. */
export default function NotFoundPing() {
  useEffect(() => {
    window.umami?.track("not-found", {
      path: location.pathname + location.search,
    });
  }, []);
  return null;
}
