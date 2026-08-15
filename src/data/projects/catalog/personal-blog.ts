import { defineProject } from "../define";

export const personalBlogProject = defineProject({
  slug: "personal-blog",
  repoName: "Luke-the-Duke-Blogger",
  displayName: "Technical Blog",
  tagline:
    "Next.js publishing platform with Markdown, search, RSS, and AI-assisted workflows",
  description:
    "A custom technical publishing platform built with Next.js, TypeScript, Firebase, and Gemini-assisted editorial tooling. It combines Markdown authoring, search, RSS, dark mode, and a cost-conscious managed backend.",
  category: "apps",
  type: "app",
  techStack: ["TypeScript", "Next.js", "Firebase", "Gemini", "Markdown"],
  private: true,
  demoOffline: true,
  highlights: [
    "Markdown authoring and live preview",
    "Search, RSS, and SEO-oriented rendering",
    "Automatic dark mode and code presentation",
    "Cost-conscious Firebase architecture",
  ],
  architecture:
    "Markdown editor → Next.js rendering → Firebase content layer → Search and RSS → Optimized delivery",
  engineeringDecisions: [
    "Own the publishing surface — Keeps technical content and presentation independent from a hosted blog platform",
    "Managed content services — Minimizes operational load for a personal publishing workload",
  ],
});
