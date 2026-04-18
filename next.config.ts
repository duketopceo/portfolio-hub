import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

  // Bypass React routing for /podcast — serve the static dashboard directly
  async rewrites() {
    return [
      {
        source: "/podcast",
        destination: "/podcast/index.html",
      },
    ];
  },
};

export default nextConfig;
