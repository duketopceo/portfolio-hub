import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // three.js stack needs transpilation under Turbopack
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],

  // Enable standalone output for Docker deployment
  output: "standalone",

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
