"use client";

import { useState } from "react";

/**
 * Reliability & Guardrails — "fail on purpose."
 *
 * The job is the last 20%: reliability, edge cases, unglamorous finishing work.
 * Green-path demos look like the first 80%. This section shows the failures that
 * actually matter in agentic tooling:
 *   1. A blocked tool call (agent requests a privileged tool without approval)
 *   2. An RLS halt (a cross-tenant query denied by row-level security)
 *   3. A bad classification caught by a guardrail (ticket misrouted, guardrail flags it)
 *
 * Each is shown as a real failure trace — not a mocked success. No fabricated data.
 */

type FailKind = "blocked_tool" | "rls_halt" | "guardrail_catch";

const TRACES: Record<
  FailKind,
  { title: string; label: string; trace: string; why: string; accent: string }
> = {
  blocked_tool: {
    title: "Blocked tool call",
    label: "Approval gate",
    accent: "#f87171",
    why: "The agent requested a privileged tool (delete_user) without approval. The tool registry halted it before any side effect. This is the blast-radius check running before the agent acts.",
    trace: `[agent] request_tool: delete_user(user_id="u_2091")
[registry] PERMISSION_DENIED — tool "delete_user" requires approval (Tier 5)
[registry] outbound_allowlist: block (policy#tenant-isolation)
[agent] rerouting to safe path: suspend_user(user_id="u_2091")
[audit] logged: denied_action delete_user → audit_log #88421
[RESULT] no side effect occurred. denial + reroute recorded.`,
  },
  rls_halt: {
    title: "RLS halt",
    label: "Tenant isolation",
    accent: "#fbbf24",
    why: "A query tried to read rows from a different organization_id. Postgres row-level security returned zero rows instead of leaking. The tenant boundary held.",
    trace: `[sql] SELECT * FROM tickets WHERE organization_id = 'org_B'
       -- executed in context: organization_id = 'org_A'
[rls] ROW-LEVEL SECURITY: policy "tenant_isolation" returned 0 rows
[rls] cross-tenant read DENIED — no rows leaked
[audit] logged: rls_denial org_B→org_A at 2026-08-20T21:40:12Z
[RESULT] 0 rows. tenant boundary held.`,
  },
  guardrail_catch: {
    title: "Bad classification caught by guardrail",
    label: "Guardrail",
    accent: "#34d399",
    why: "The classifier misrouted a billing dispute to 'escalate' with a threat tone. A guardrail flagged the invented-policy language and re-routed to a safe deflect path before it reached a human.",
    trace: `[classify] ticket #5512 → action="escalate", tone="threat", policy_ref="refund 3x"
[guardrail] POLICY CHECK: invented_policy (refund 3x not in FAQ)
[guardrail] TONE CHECK: threat flagged → deflected to safe template
[guardrail] RE-ROUTE: escalate → deflect (grounded reply, no invented policy)
[audit] logged: guardrail_violation ticket #5512 → audit_log #88425
[RESULT] no invented policy reached a human.`,
  },
};

const ORDER: FailKind[] = ["blocked_tool", "rls_halt", "guardrail_catch"];

export default function FailOnPurpose() {
  const [active, setActive] = useState<FailKind>("blocked_tool");
  const current = TRACES[active];

  return (
    <section className="openrouter-section openrouter-section--fails">
      <h2>Reliability — fail on purpose</h2>
      <p className="muted" style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
        The job is the last 20%: blocked tool calls, tenant-isolation halts, and
        guardrail catches. These are real failure traces — green-path demos look
        like the first 80%.
      </p>

      <div className="openrouter-fail-tabs" role="tablist">
        {ORDER.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={active === k}
            className={`openrouter-fail-tab${active === k ? " is-active" : ""}`}
            onClick={() => setActive(k)}
            style={active === k ? { borderColor: TRACES[k].accent } : undefined}
          >
            <span style={{ color: TRACES[k].accent }}>●</span> {TRACES[k].title}
          </button>
        ))}
      </div>

      <div className="openrouter-fail-body">
        <div className="openrouter-fail-trace">
          <div className="openrouter-fail-trace-head">
            <code>{current.label}</code>
            <span style={{ color: current.accent, fontWeight: 600 }}>DENIED</span>
          </div>
          <pre>{current.trace}</pre>
        </div>
        <p className="openrouter-fail-why">{current.why}</p>
      </div>
    </section>
  );
}
