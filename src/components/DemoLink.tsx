"use client";

import { ExternalIcon } from "./Icons";

interface DemoLinkProps {
  url: string;
}

export default function DemoLink({ url }: DemoLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="cosmic-card-demo"
      data-umami-event="live-demo"
      data-umami-event-url={url}
    >
      <span className="cosmic-card-demo__left">
        <span className="cosmic-card-demo__pulse" aria-hidden />
        <span>Open live demo</span>
      </span>
      <ExternalIcon className="w-4 h-4 opacity-70 shrink-0" aria-hidden />
    </a>
  );
}
