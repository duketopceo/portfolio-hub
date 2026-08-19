export type OpenRouterDemo = {
  slug: string;
  name: string;
  role: string;
  summary: string;
  scoring: string;
  sourceUrl: string;
  sourceNote?: string;
  status: "placeholder" | "live";
};

/**
 * OpenRouter application demos — grounded in daily operator workflows
 * (Auto Router, presets, Guardrails, bake-offs). Live scores ship with demo repos.
 */
export const openRouterDemos: OpenRouterDemo[] = [
  {
    slug: "deflect",
    name: "Deflect",
    role: "Applied AI Engineer (Support)",
    summary:
      "Routes inbound support tickets through OpenRouter with Guardrails — classify, deflect with grounded replies, or escalate with a structured handoff.",
    scoring:
      "Eval fixtures on classify/deflect/escalate accuracy, guardrail violation rate, and escalation precision.",
    sourceUrl: "/openrouter",
    sourceNote:
      "Source ships with the Deflect demo repo on GitHub when public.",
    status: "placeholder",
  },
  {
    slug: "motion",
    name: "Motion",
    role: "Applied AI Engineer (GTM)",
    summary:
      "Uses OpenRouter Auto Router and presets to turn inbound GTM signals into a ranked next action with rationale.",
    scoring:
      "Eval suite on next-action relevance, preset consistency, and coverage across inbound intent fixtures.",
    sourceUrl: "/openrouter",
    sourceNote:
      "Source ships with the Motion demo repo on GitHub when public.",
    status: "placeholder",
  },
  {
    slug: "bakeoff",
    name: "Bakeoff",
    role: "AI Provider Operations",
    summary:
      "Daily-style model and endpoint bake-offs on OpenRouter — latency, cost, and quality compared before a launch gate.",
    scoring:
      "Pass/fail launch gate on latency SLOs, cost ceilings, and quality benchmarks per endpoint.",
    sourceUrl: "/openrouter",
    sourceNote:
      "Source ships with the Bakeoff demo repo on GitHub when public.",
    status: "placeholder",
  },
];

export const openRouterOwnerUrl = "https://github.com/duketopceo";
