import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";
import { retiredSlugRedirects } from "./src/data/redirects";

const nextConfig: NextConfig = {
  // Keep worktree builds rooted here when the parent checkout also has a lockfile.
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },

  // three.js stack needs transpilation under Turbopack
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],

  // Enable standalone output for Docker deployment
  output: "standalone",
  poweredByHeader: false,

  // Hash-based Subresource Integrity: strict CSP compatible with static
  // generation (no per-request nonce needed) — integrity attrs on chunks.
  experimental: {
    sri: { algorithm: "sha384" },
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      // 'unsafe-inline' is required for Next.js hydration payloads on
      // statically-generated pages (no nonce available at build time).
      "script-src 'self' 'unsafe-inline' https://analytics.pacehq.io",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://avatars.githubusercontent.com https://raw.githubusercontent.com https://camo.githubusercontent.com https://media.luke-the-duke.com",
      "media-src 'self' https://media.luke-the-duke.com",
      "font-src 'self' data:",
      "connect-src 'self' https://analytics.pacehq.io",
      "frame-src 'self' https://*.luke-the-duke.com https://open.spotify.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },

  // Image optimization — allow GitHub avatars
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },

  // Podcast dashboards moved to the show site (Cloudflare Pages serves
  // directory-index URLs like /podcast/episodes/ep009/ that this app's
  // static layer can't). One permanent hop keeps every old apex path —
  // including vault-recorded links — landing on the canonical copy.
  async redirects() {
    return [
      {
        source: "/podcast/:path*",
        destination: "https://show.luke-the-duke.com/podcast/:path*",
        permanent: true,
      },
      ...retiredSlugRedirects(),
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
});
