import { defineProject } from "../define";

export const financeFrenzyProject = defineProject({
  slug: "finance-frenzy",
  repoName: "FinanceFrenzy",
  displayName: "Finance Frenzy",
  tagline:
    "Award-winning financial literacy simulation rebuilt in Unreal Engine 5",
  description:
    "A financial literacy game where players navigate twenty years of historical market conditions, make investment and spending decisions, and review the cash-flow consequences. The original hackathon prototype won Best Finance Hack and placed in the overall Top 6; the current repository includes an Unreal Engine 5 rebuild.",
  category: "finance",
  type: "app",
  techStack: ["Unreal Engine 5", "C++", "Blueprints", "Python", "PyQt6"],
  status: "showcase",
  private: true,
  liveUrl: "https://devpost.com/software/finance-frenzy/",
  demoUrl: "https://devpost.com/software/finance-frenzy/",
  embeddable: false,
  highlights: [
    "Best Finance Hack and overall Top 6 recognition",
    "Twenty-year simulation driven by historical market data",
    "Eleven sector ETFs plus financial life events",
    "Modern UE5 rebuild with the original Python prototype preserved",
  ],
  architecture:
    "Historical market data → Simulation rules → UE5 C++ and Blueprints → Portfolio decisions → Cash-flow analysis",
  engineeringDecisions: [
    "Historical data over synthetic prices — Connects game decisions to recognizable market cycles",
    "Preserve the prototype — Makes the evolution from hackathon concept to engine-based rebuild inspectable",
  ],
});
