import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Keep worktree builds rooted here when the parent checkout also has a lockfile.
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },

  // three.js stack needs transpilation under Turbopack
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],

  // Enable standalone output for Docker deployment
  output: "standalone",
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
});
