export type OpenRouterDemo = {
  slug: string;
  name: string;
  role: string;
  summary: string;
  scoring: string;
  sourceUrl: string;
  sourceNote?: string;
  /** fixtures = offline pytest on fixtures; live = requires OPENROUTER_API_KEY */
  status: "fixtures" | "live";
};

export const OPENROUTER_DEMOS_REPO_URL =
  "https://github.com/duketopceo/openrouter-demos";

export const openRouterOwnerUrl = "https://github.com/duketopceo";

function demoSourcePath(folder: string): string {
  return `${OPENROUTER_DEMOS_REPO_URL}/tree/main/${folder}`;
}

/**
 * OpenRouter application demos — public repo: duketopceo/openrouter-demos
 */
export const openRouterDemos: OpenRouterDemo[] = [
  {
    slug: "deflect",
    name: "Deflect",
    role: "Applied AI Engineer (Support)",
    summary:
      "Routes inbound support tickets through OpenRouter with Guardrails — classify, deflect with grounded replies, or escalate with a structured handoff.",
    scoring:
      "Eval harness on classify / deflect / escalate and guardrail violations — fixture-based, no live accuracy claims here.",
    sourceUrl: demoSourcePath("deflect"),
    sourceNote:
      "Offline pytest passes on fixtures. Live evals need OPENROUTER_API_KEY.",
    status: "fixtures",
  },
  {
    slug: "motion",
    name: "Motion",
    role: "Applied AI Engineer (GTM)",
    summary:
      "Uses OpenRouter Auto Router and presets to turn inbound GTM signals into a ranked next action with rationale.",
    scoring:
      "Eval harness on next-action relevance and preset consistency across inbound fixtures.",
    sourceUrl: demoSourcePath("motion"),
    sourceNote:
      "Offline pytest passes on fixtures. Live evals need OPENROUTER_API_KEY.",
    status: "fixtures",
  },
  {
    slug: "bakeoff",
    name: "Bakeoff",
    role: "AI Provider Operations",
    summary:
      "Daily-style model and endpoint bake-offs on OpenRouter — latency, cost, and quality compared before a launch gate.",
    scoring:
      "Launch-gate pass/fail on latency, cost, and quality fixtures per endpoint.",
    sourceUrl: demoSourcePath("bakeoff"),
    sourceNote:
      "Offline pytest passes on fixtures. Live evals need OPENROUTER_API_KEY.",
    status: "fixtures",
  },
  {
    slug: "caesar",
    name: "Caesar",
    role: "Model evaluation & debate",
    summary:
      "Two OpenRouter models debate; Caesar (a third model) scores each round and enforces real concessions. Dense JSON traces — not a dashboard wrapper.",
    scoring:
      "Concession rules plus trace schema — regex and Caesar must agree before a match ends.",
    sourceUrl: demoSourcePath("caesar"),
    sourceNote:
      "Offline pytest passes on fixtures. Live evals need OPENROUTER_API_KEY.",
    status: "fixtures",
  },
];
