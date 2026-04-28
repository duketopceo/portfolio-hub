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

export default nextConfig;
