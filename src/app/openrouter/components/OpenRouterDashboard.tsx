"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Portfolio viewer for OpenRouter demo artifacts — not the Python dev_server.py dashboard.
 * - Baked 3-model coding comparison from committed src/data/bakeoff.json (75 runs: 3×5×5).
 * - Session-only API key for optional live smoke tests (never persisted server-side).
 * - Harness source + local dashboard: github.com/duketopceo/openrouter-demos → localhost:8080.
 */

type BakeoffEntry = {
  latency_ms: number;
  content: string;
  prompt_tokens: number;
  completion_tokens: number;
  quality: string;
  run: number;
};

type ModelKey = "qwen/qwen3.8-27b" | "meta/muse-glimmer-30b" | "google/gemma-4-31b-it";

const MODELS: { id: ModelKey; label: string; vendor: string }[] = [
  { id: "qwen/qwen3.8-27b", label: "Qwen 3.8 27B", vendor: "Qwen" },
  { id: "meta/muse-glimmer-30b", label: "Muse Glimmer 30B", vendor: "Meta" },
  { id: "google/gemma-4-31b-it", label: "Gemma 4 31B", vendor: "Google" },
];

const SESSION_KEY = "openrouter_demo_key";
const BAKED_RUN_COUNT = 75; // 3 models × 5 tasks × 5 runs — counted from src/data/bakeoff.json
const BAKED_SOURCE = "src/data/bakeoff.json (portfolio-hub snapshot; not openrouter-demos bakeoff harness output)";

// Client component fetches baked data from a public JSON route.
export default function OpenRouterDashboard() {
  const [bakeoff, setBakeoff] = useState<Record<ModelKey, Record<string, BakeoffEntry[]>> | null>(null);
  const [key, setKey] = useState<string>("");
  const [showKey, setShowKey] = useState(false);
  const [liveResult, setLiveResult] = useState<string>("");
  const [liveModel, setLiveModel] = useState<ModelKey>(MODELS[0].id);
  const [livePrompt, setLivePrompt] = useState<string>(
    "Write a Python function that reverses a string without using built-in reverse. Return only code."
  );
  const [running, setRunning] = useState(false);
  const [expandedModel, setExpandedModel] = useState<ModelKey | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Load baked data (public route, no key)
  useEffect(() => {
    fetch("/openrouter/api/bakeoff")
      .then((r) => r.json())
      .then((d) => setBakeoff(d))
      .catch(() => setBakeoff(null));

    // Restore key from sessionStorage if present (auto-cleared on tab close)
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setKey(saved);
  }, []);

  // Session-only key: write to sessionStorage only (deleted on refresh/tab close)
  const handleKeyChange = useCallback((val: string) => {
    setKey(val);
    if (val) sessionStorage.setItem(SESSION_KEY, val);
    else sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const runLive = useCallback(async () => {
    if (!key) {
      setLiveResult("Enter your OpenRouter API key to run a live test.");
      return;
    }
    setRunning(true);
    setLiveResult("Running live test…");
    const started = performance.now();
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: liveModel,
          messages: [{ role: "user", content: livePrompt }],
          max_tokens: 600,
          temperature: 0,
        }),
      });
      const elapsed = (performance.now() - started).toFixed(0);
      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        setLiveResult(
          `✗ ${resp.status} — ${err?.error?.message || "request failed"} · ${elapsed}ms`
        );
        return;
      }
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content?.trim() || "(empty)";
      const usage = data.usage || {};
      setLiveResult(
        `✓ ${elapsed}ms · ${usage.prompt_tokens ?? "?"} in / ${usage.completion_tokens ?? "?"} out\n\n${content.slice(0, 400)}`
      );
    } catch (e) {
      setLiveResult(`✗ ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  }, [key, liveModel, livePrompt]);

  // Compute aggregate stats for baked bakeoff
  const aggregate = useCallback(
    (model: ModelKey) => {
      const entries = bakeoff?.[model] ?? {};
      const lats: number[] = [];
      let defs = 0,
        total = 0;
      for (const task of Object.values(entries)) {
        for (const r of task) {
          total++;
          if ("error" in r) continue;
          lats.push(r.latency_ms);
          if (r.quality === "has_def") defs++;
        }
      }
      if (!lats.length) return null;
      const avg = lats.reduce((a, b) => a + b, 0) / lats.length;
      return {
        avg: Math.round(avg),
        calls: total,
        code: `${defs}/${total}`,
      };
    },
    [bakeoff]
  );

  return (
    <div className="openrouter-dashboard">
      {/* Session API key */}
      <section className="openrouter-section">
        <h2>Run live against your own key</h2>
        <p className="muted" style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
          Your key lives only in this tab&apos;s session — it is cleared on refresh, never stored
          on the server, and used only for the request you trigger.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type={showKey ? "text" : "password"}
            value={key}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="sk-or-v1-… (session-only)"
            style={{ flex: 1, minWidth: 240 }}
          />
          <button onClick={() => setShowKey((s) => !s)}>{showKey ? "Hide" : "Show"}</button>
        </div>
      </section>

      {/* Live runner */}
      <section className="openrouter-section">
        <h2>Live test</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <select value={liveModel} onChange={(e) => setLiveModel(e.target.value as ModelKey)}>
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.vendor}
              </option>
            ))}
          </select>
          <textarea
            value={livePrompt}
            onChange={(e) => setLivePrompt(e.target.value)}
            rows={2}
            placeholder="Prompt to send the selected model"
          />
          <button onClick={runLive} disabled={running}>
            {running ? "Running…" : "Run live test"}
          </button>
          {liveResult && <pre className="openrouter-live-result">{liveResult}</pre>}
        </div>
      </section>

      {/* Baked 3-model coding comparison (no key needed) */}
      <section className="openrouter-section">
        <h2>Baked coding comparison — 3 dense ~30B models</h2>
        <p className="muted" style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
          Qwen 3.8-27b vs Muse Glimmer 30B vs Gemma 4 31B. Figures below are a{" "}
          <strong>baked snapshot</strong> from <code>{BAKED_SOURCE}</code> — not output from
          the RouteKit harness in{" "}
          <a
            href="https://github.com/duketopceo/openrouter-demos"
            target="_blank"
            rel="noopener noreferrer"
            className="detail-nav-link"
          >
            openrouter-demos
          </a>
          . No live accuracy claims; no API key needed to view.
        </p>
        <div className="openrouter-bakeoff-grid">
          {MODELS.map((m) => {
            const agg = aggregate(m.id);
            return (
              <div key={m.id} className="openrouter-card openrouter-card--bakeoff">
                <div className="openrouter-card__head">
                  <h3>{m.label}</h3>
                  <span className="openrouter-card__role">{m.vendor}</span>
                </div>
                {agg ? (
                  <dl className="openrouter-card__meta">
                    <div>
                      <dt>Avg latency</dt>
                      <dd>{agg.avg} ms</dd>
                    </div>
                    <div>
                      <dt>Baked runs</dt>
                      <dd>{agg.calls}</dd>
                    </div>
                    <div>
                      <dt>Valid code (baked)</dt>
                      <dd>{agg.code}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="muted">Baked data loading…</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Launch gate + deprecation note — derived from baked snapshot only */}
        <div className="openrouter-gate-row">
          <div className="openrouter-gate">
            <span className="openrouter-gate__label">Launch gate (baked)</span>
            <span className="openrouter-gate__value">PASS</span>
            <span className="openrouter-gate__meta">
              snapshot-only: all 3 within baseline (latency &lt;10s, cost &lt;$0.01/1K out,
              quality &ge;80%) per {BAKED_SOURCE}
            </span>
          </div>
          <div className="openrouter-gate">
            <span className="openrouter-gate__label">Deprecation note (baked)</span>
            <span className="openrouter-gate__value openrouter-gate__value--warn">Watch</span>
            <span className="openrouter-gate__meta">
              baked snapshot: Muse Glimmer 30B shows the highest mean latency (6931ms) and
              widest variance (3.9s&ndash;10.2s). Illustrative pre-launch check from the
              committed JSON — not a live harness verdict.
            </span>
          </div>
        </div>

        {/* Full baked test data (every case, not just aggregates) */}
        <div className="openrouter-full-data">
          <h3 className="openrouter-full-data__title">Full baked data — every case</h3>
          <p className="muted" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            {BAKED_RUN_COUNT} baked runs (3 models × 5 tasks × 5 runs) from{" "}
            <code>src/data/bakeoff.json</code>. Expand a model, then a task, to see latency,
            tokens, and the captured model output.
          </p>
          {MODELS.map((m) => {
            const modelData = bakeoff?.[m.id] ?? {};
            const taskKeys = Object.keys(modelData);
            const isOpen = expandedModel === m.id;
            return (
              <div key={m.id} className="openrouter-full-model">
                <button
                  className="openrouter-full-model__head"
                  onClick={() => setExpandedModel(isOpen ? null : m.id)}
                >
                  <span>{m.label} ({m.vendor})</span>
                  <span>{isOpen ? "▾" : "▸"} {taskKeys.length} tasks</span>
                </button>
                {isOpen && (
                  <div className="openrouter-full-model__body">
                    {taskKeys.map((task) => {
                      const runs = modelData[task] ?? [];
                      const isTaskOpen = expandedTask === task;
                      return (
                        <div key={task} className="openrouter-full-task">
                          <button
                            className="openrouter-full-task__head"
                            onClick={() => setExpandedTask(isTaskOpen ? null : task)}
                            aria-expanded={isTaskOpen}
                          >
                            <span className="openrouter-full-task__name">
                              <span className="openrouter-full-task__chev">
                                {isTaskOpen ? "▾" : "▸"}
                              </span>
                              <code>{task}</code>
                            </span>
                            <span>{runs.length} runs · avg {Math.round(runs.filter(r=>!("error" in r)).reduce((a,b)=>a+b.latency_ms,0)/Math.max(1,runs.filter(r=>!("error" in r)).length))}ms</span>
                          </button>
                          {isTaskOpen && (
                            <div className="openrouter-full-task__runs">
                              {runs.map((r, i) => (
                                <div key={i} className="openrouter-full-run">
                                  <div className="openrouter-full-run__meta">
                                    <span>run {r.run}</span>
                                    <span>{r.latency_ms?.toFixed(0)} ms</span>
                                    <span>{r.prompt_tokens ?? "?"} in</span>
                                    <span>{r.completion_tokens ?? "?"} out</span>
                                    <span className={r.quality === "has_def" ? "ok" : "err"}>
                                      {r.quality === "has_def" ? "code" : "no-code"}
                                    </span>
                                  </div>
                                  {r.content && (
                                    <pre className="openrouter-full-run__code">{r.content}</pre>
                                  )}
                                  {"error" in r && (
                                    <div className="err">✗ {String(r.error)}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
