import { defineProject } from "../define";

export const lukeTheDukeShowProject = defineProject({
  slug: "luke-the-duke-show",
  repoName: "lukethedukeshow",
  displayName: "Luke the Duke Show",
  tagline:
    "Podcast site and episode deck with a recording-focused broadcast mode",
  description:
    "A dedicated Next.js surface for podcast episodes, carousels, and recording-quality presentation decks. It shares the broader Cosmic visual language while retaining an independent content and deployment lifecycle.",
  category: "apps",
  type: "app",
  techStack: ["TypeScript", "Next.js", "React", "Tailwind", "Podcast"],
  tier: "supporting",
  private: true,
  highlights: [
    "Episode shell and carousel structure",
    "Broadcast mode for recording-quality decks",
    "Independent show content and deployment pipeline",
  ],
  architecture:
    "Next.js App Router → Episode templates → Broadcast deck mode → Static and server delivery",
  engineeringDecisions: [
    "Dedicated product repository — Keeps show content and recording workflows independent from the portfolio",
  ],
});
