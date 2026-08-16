"use client";

import { ExternalIcon } from "./Icons";

interface GithubLinkProps {
  url: string;
}

export default function GithubLink({ url }: GithubLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="cosmic-card-demo"
    >
      <span className="cosmic-card-demo__left">
        <span>View on GitHub</span>
      </span>
      <ExternalIcon className="w-4 h-4 opacity-70 shrink-0" aria-hidden />
    </a>
  );
}
