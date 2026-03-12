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
      className="flex items-center justify-between px-4 py-2 transition-colors"
      style={{
        borderTop: "1px solid var(--color-divider)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        color: "var(--color-live)",
        textDecoration: "none",
      }}
    >
      <span className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: "var(--color-live)" }}
        />
        Open Live Demo
      </span>
      <ExternalIcon className="w-3 h-3" />
    </a>
  );
}
