"use client";

import { useState } from "react";
import { ExternalIcon } from "./Icons";

interface DemoEmbedProps {
  url: string;
  title: string;
  embeddable?: boolean;
}

export default function DemoEmbed({ url, title, embeddable }: DemoEmbedProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  if (embeddable) {
    return (
      <div
        className="glass-card overflow-hidden"
        style={{ borderRadius: "var(--radius-lg)" }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{
            background: "var(--color-surface-2)",
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: "rgba(255,95,87,0.6)" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "rgba(255,189,46,0.6)" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "rgba(39,201,63,0.6)" }} />
            </div>
            <div
              className="ml-2 px-2.5 py-0.5 rounded-md truncate max-w-xs"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
                background: "var(--color-surface-3)",
                border: "1px solid var(--color-border)",
              }}
            >
              {url.replace(/^https?:\/\//, "").split("?")[0]}
            </div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-faint)",
              textDecoration: "none",
            }}
          >
            Open
            <ExternalIcon className="w-3 h-3" />
          </a>
        </div>

        {/* Iframe area */}
        <div className="relative" style={{ height: "480px" }}>
          {!showIframe ? (
            <button
              onClick={() => setShowIframe(true)}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer"
              style={{ background: "var(--color-surface)" }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--color-accent-muted)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <svg className="w-5 h-5 ml-0.5" fill="var(--color-accent)" viewBox="0 0 20 20">
                  <path d="M6 4l12 6-12 6V4z" />
                </svg>
              </div>
              <div className="text-center">
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    color: "var(--color-text)",
                    marginBottom: "2px",
                  }}
                >
                  Launch Demo
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-faint)",
                  }}
                >
                  Click to load the application
                </p>
              </div>
            </button>
          ) : (
            <>
              {!iframeLoaded && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: "var(--color-border)",
                        borderTopColor: "var(--color-accent)",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-faint)",
                      }}
                    >
                      Loading...
                    </span>
                  </div>
                </div>
              )}
              <iframe
                src={url}
                title={`${title} Demo`}
                className="w-full h-full border-0"
                onLoad={() => setIframeLoaded(true)}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                loading="lazy"
                style={{
                  opacity: iframeLoaded ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  // Non-embeddable — launch card
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card block p-6 sm:p-8 text-center group"
      style={{ textDecoration: "none" }}
    >
      <div
        className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
        style={{
          background: "var(--color-accent-muted)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <ExternalIcon className="w-5 h-5" />
      </div>
      <p
        className="mb-1"
        style={{
          fontSize: "var(--text-base)",
          fontWeight: 600,
          color: "var(--color-text)",
        }}
      >
        View Live Demo
      </p>
      <p
        className="mb-3"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-faint)",
        }}
      >
        Opens in a new tab
      </p>
      <span
        className="inline-flex items-center gap-1 px-3 py-1 rounded-md"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-faint)",
          background: "var(--color-surface-3)",
          border: "1px solid var(--color-border)",
        }}
      >
        {url.replace(/^https?:\/\//, "").split("?")[0]}
        <ExternalIcon className="w-3 h-3" />
      </span>
    </a>
  );
}
