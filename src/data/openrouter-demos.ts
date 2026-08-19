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
 * OpenRouter application demos — curated for role-aligned evaluation.
 * Live scores ship with demo repos; placeholders are honest until wired.
 */
export const openRouterDemos: OpenRouterDemo[] = [
  {
    slug: "deflect",
    name: "Deflect",
    role: "Applied AI Engineer (Support)",
    summary:
      "Classifies inbound support tickets, deflects with grounded replies, or escalates with a structured handoff.",
    scoring:
      "Eval suite on classify / deflect / escalate accuracy, guardrail violations, and escalation precision.",
    sourceUrl: "/openrouter",
    sourceNote: "Source ships with the Deflect demo repo on GitHub.",
    status: "placeholder",
  },
  {
    slug: "motion",
    name: "Motion",
    role: "Applied AI Engineer (GTM)",
    summary:
      "Turns inbound GTM signals into a ranked next action with rationale tied to pipeline context.",
    scoring:
      "Eval suite on next-action relevance, coverage of inbound intents, and consistency across fixtures.",
    sourceUrl: "/openrouter",
    sourceNote: "Source ships with the Motion demo repo on GitHub.",
    status: "placeholder",
  },
  {
    slug: "bakeoff",
    name: "Bakeoff",
    role: "AI Provider Operations",
    summary:
      "Compares models and endpoints on latency, cost, and quality to gate provider launches.",
    scoring:
      "Launch-gate pass/fail on latency SLOs, cost ceilings, and quality benchmarks per endpoint.",
    sourceUrl: "/openrouter",
    sourceNote: "Source ships with the Bakeoff demo repo on GitHub.",
    status: "placeholder",
  },
];

export const openRouterOwnerUrl = "https://github.com/duketopceo";
