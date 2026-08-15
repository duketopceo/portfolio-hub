import { defineProject } from "../define";

export const homelabProject = defineProject({
  slug: "homelab",
  repoName: "homelab",
  displayName: "Homelab",
  tagline:
    "Three-node Mac Mini Swarm — Tailscale mesh, Traefik, tunnels, and monitoring",
  description:
    "A three-node Apple Silicon homelab that runs containerized applications and internal tooling. The cluster1–cluster3 nodes communicate over a Tailscale mesh; Traefik and Cloudflare Tunnel provide controlled ingress while monitoring and auto-discovery keep the small fleet operable.",
  category: "infra",
  type: "infra",
  techStack: ["Docker", "Swarm", "Traefik", "Cloudflare", "Tailscale"],
  tier: "core",
  featured: true,
  private: true,
  highlights: [
    "Three-node Apple Silicon container cluster",
    "Encrypted cluster1–cluster3 Tailscale mesh",
    "Traefik and Cloudflare Tunnel ingress",
    "Asset tracking, monitoring, and service discovery",
  ],
  architecture:
    "GitHub delivery → Docker Swarm → Tailscale cluster mesh → Traefik → Cloudflare Tunnel",
  businessContext:
    "The lab demonstrates production deployment, networking, and observability patterns on a cost-conscious self-hosted footprint.",
  scopeAndScale:
    "Three Mac Mini nodes host portfolio, data, messaging, and agent workloads.",
  engineeringDecisions: [
    "Swarm for the three-node footprint — Balances orchestration with operator simplicity",
    "Tailscale mesh — Encrypts node communication without exposing private network addressing",
    "Tunnel ingress — Publishes selected services without opening the local network edge",
  ],
});
