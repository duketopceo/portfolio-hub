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

  // Hard redirect /podcast and /podcast/ to the standalone static dashboard
  // Static file lives at public/podcast/index.html → served at /podcast/index.html
  async redirects() {
    return [
      {
        source: "/podcast",
        destination: "/podcast/index.html",
        permanent: false,
      },
      {
        source: "/podcast/",
        destination: "/podcast/index.html",
        permanent: false,
      },
      {
        source: "/podcast/mission",
        destination: "/podcast/live.html",
        permanent: false,
      },
      {
        source: "/podcast/live",
        destination: "/podcast/live.html",
        permanent: false,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
});
