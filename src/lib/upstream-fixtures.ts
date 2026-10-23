/**
 * Fixtures for src/lib/upstream.ts: GitHub search API items shaped like the
 * live response. Rows are the allowlisted public PRs from the 2026-10-20
 * audit, plus synthetic rows that exercise dropping and scrubbing. Work-org
 * rows from the audit are deliberately absent.
 */
export interface GhSearchPrItem {
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  draft?: boolean;
  created_at: string;
  closed_at: string | null;
  repository_url: string;
  pull_request: { merged_at: string | null };
  /** Fixture-only: how a faithful GitHub stub treats `is:public`. */
  fixtureVisibility?: "private";
}

interface Row {
  repo: string;
  number: number;
  title: string;
  state: "open" | "closed";
  draft?: boolean;
  created: string;
  closed?: string;
  merged?: string;
  visibility?: "private";
}

const ROWS: Row[] =
[
  {
    repo: "ssupt/omarchy-audio-control",
    number: 26,
    title: "Restyle panel interactions: clicks always land, failures always show",
    state: "open",
    draft: false,
    created: "2026-10-20T12:00:00Z"
  },
  {
    repo: "ssupt/omarchy-audio-control",
    number: 25,
    title: "Fix dead device clicks in the default-device selector",
    state: "open",
    draft: false,
    created: "2026-10-20T12:00:00Z"
  },
  {
    repo: "cline/marketplace",
    number: 224,
    title: "Add agentflow skill",
    state: "open",
    draft: false,
    created: "2026-10-12T12:00:00Z"
  },
  {
    repo: "akitaonrails/ai-usagebar",
    number: 407,
    title: "fix(omarchy): render block-graph rows monospace and unwrapped",
    state: "closed",
    draft: false,
    created: "2026-10-10T12:00:00Z",
    closed: "2026-10-10T12:00:00Z"
  },
  {
    repo: "akitaonrails/ai-usagebar",
    number: 406,
    title: "fix(omarchy): bind Flow height to implicitHeight, not childrenRect",
    state: "closed",
    draft: false,
    created: "2026-10-10T12:00:00Z",
    merged: "2026-10-10T12:00:00Z",
    closed: "2026-10-10T12:00:00Z"
  },
  {
    repo: "EveryInc/compound-engineering-plugin",
    number: 1851,
    title: "feat(ce-code-review): add simplification reviewer persona",
    state: "closed",
    draft: false,
    created: "2026-10-10T12:00:00Z",
    closed: "2026-10-10T12:00:00Z"
  },
  {
    repo: "agent0ai/a0-plugins",
    number: 620,
    title: "Add plugin: notion",
    state: "open",
    draft: false,
    created: "2026-10-10T12:00:00Z"
  },
  {
    repo: "agent0ai/a0-plugins",
    number: 619,
    title: "Add plugin: jev_compact",
    state: "open",
    draft: false,
    created: "2026-10-10T12:00:00Z"
  },
  {
    repo: "agent0ai/a0-plugins",
    number: 618,
    title: "Add plugin: glitchtip",
    state: "open",
    draft: false,
    created: "2026-10-10T12:00:00Z"
  },
  {
    repo: "agent0ai/a0-plugins",
    number: 617,
    title: "Add plugin: device_sync",
    state: "open",
    draft: false,
    created: "2026-10-10T12:00:00Z"
  },
  {
    repo: "agent0ai/a0-plugins",
    number: 616,
    title: "Add plugin: durable",
    state: "open",
    draft: false,
    created: "2026-10-10T12:00:00Z"
  },
  {
    repo: "ParthJain18/groq_flow",
    number: 1,
    title: "fix(windows): resolve cp1252 encoding error and validate placeholder API keys",
    state: "closed",
    draft: false,
    created: "2026-10-04T12:00:00Z",
    closed: "2026-10-04T12:00:00Z"
  },
  {
    repo: "agent0ai/a0-plugins",
    number: 598,
    title: "docs: note optional CBM code-graph index for agents",
    state: "closed",
    draft: false,
    created: "2026-09-30T12:00:00Z",
    closed: "2026-09-30T12:00:00Z"
  },
  {
    repo: "agent0ai/a0-plugins",
    number: 597,
    title: "feat: add omaseal",
    state: "closed",
    draft: false,
    created: "2026-09-30T12:00:00Z",
    merged: "2026-09-30T12:00:00Z",
    closed: "2026-09-30T12:00:00Z"
  },
  {
    repo: "NousResearch/hermes-agent",
    number: 129023,
    title: "fix(desktop): disable GPU on Apple-Silicon Linux (16K-page kernels)",
    state: "open",
    draft: false,
    created: "2026-09-30T12:00:00Z"
  },
  {
    repo: "agent0ai/a0-plugins",
    number: 572,
    title: "Add plugin: argus",
    state: "closed",
    draft: false,
    created: "2026-09-19T12:00:00Z",
    merged: "2026-09-19T12:00:00Z",
    closed: "2026-09-19T12:00:00Z"
  },
  {
    repo: "rowboatlabs/rowboat",
    number: 1092,
    title: "feat(code-mode): make OpenCode, Cursor, and Hermes the coding agents",
    state: "open",
    draft: false,
    created: "2026-09-17T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 448,
    title: "feat(secrets): first-party keyring commands and secrets panel",
    state: "open",
    draft: false,
    created: "2026-09-15T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 421,
    title: "fix(update): report dev-checkout updates at release granularity",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 420,
    title: "fix(screensaver): report a missing ttfx once instead of respawning it",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 419,
    title: "fix(migrations): rewrite hyprlock.conf references in the theme-state move",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 418,
    title: "fix(browsers): disable hardware video decode on Chromium-family browsers",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 417,
    title: "fix(install): keep SSH reachable when sshd will start on the target",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 416,
    title: "fix(menu): install Prism Launcher for Minecraft on aarch64",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 415,
    title: "fix(migrations): test SingletonLock liveness, not existence",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 414,
    title: "fix(migrations): don't fail the update over an unloadable sleep-lock unit",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 413,
    title: "fix(install): fail honestly when Dropbox cannot be installed",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 412,
    title: "fix(install): install the Spotify web app when no native client exists",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 411,
    title: "feat(hw): detect fingerprint readers beyond the USB bus",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 410,
    title: "fix(defaults): accept nano, micro, fresh, and hx as default editors",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 409,
    title: "fix(setup): point setup-keyboard at the provisioning form",
    state: "open",
    draft: false,
    created: "2026-09-12T12:00:00Z"
  },
  {
    repo: "solari-sdk/solari-cookbook",
    number: 3,
    title: "feat: add browser + sandbox pricing reporter example",
    state: "open",
    draft: false,
    created: "2026-09-01T12:00:00Z"
  },
  {
    repo: "solari-sdk/solari-cookbook",
    number: 2,
    title: "feat: add browser pricing scraper example",
    state: "closed",
    draft: false,
    created: "2026-08-31T12:00:00Z",
    closed: "2026-08-31T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-port-forward-plugin",
    number: 1,
    title: "Use Color tokens for muted, accent, and urgent states",
    state: "open",
    draft: true,
    created: "2026-08-29T12:00:00Z"
  },
  {
    repo: "agent0ai/a0-plugins",
    number: 498,
    title: "feat: add openrouter_usage",
    state: "closed",
    draft: false,
    created: "2026-08-28T12:00:00Z",
    merged: "2026-08-28T12:00:00Z",
    closed: "2026-08-28T12:00:00Z"
  },
  {
    repo: "agent0ai/a0-plugins",
    number: 497,
    title: "feat: add kurultai_people",
    state: "closed",
    draft: false,
    created: "2026-08-28T12:00:00Z",
    merged: "2026-08-28T12:00:00Z",
    closed: "2026-08-28T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 9001,
    title: "Synthetic: scrub email luke@example.com in title",
    state: "open",
    created: "2026-10-19T12:00:00Z"
  },
  {
    repo: "cline/marketplace",
    number: 9002,
    title: "Synthetic: Bartlett internal rollout notes",
    state: "open",
    created: "2026-10-19T12:00:00Z"
  },
  {
    repo: "omacom/omarchy-mac",
    number: 9003,
    title: "Synthetic private-repo row",
    state: "open",
    created: "2026-10-19T12:00:00Z",
    visibility: "private"
  },
  {
    repo: "someone-else/not-allowlisted",
    number: 9004,
    title: "Synthetic non-allowlisted row",
    state: "open",
    created: "2026-10-19T12:00:00Z"
  }
];

export function fixtureSearchItems(): GhSearchPrItem[] {
  return ROWS.map((r) => ({
    number: r.number,
    title: r.title,
    html_url: `https://github.com/${r.repo}/pull/${r.number}`,
    state: r.state,
    draft: r.draft,
    created_at: r.created,
    closed_at: r.closed ?? null,
    repository_url: `https://api.github.com/repos/${r.repo}`,
    pull_request: { merged_at: r.merged ?? null },
    ...(r.visibility ? { fixtureVisibility: r.visibility } : {}),
  }));
}
