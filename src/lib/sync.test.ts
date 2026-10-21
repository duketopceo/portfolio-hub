import { describe, expect, it, vi } from "vitest";
import {
  PrivateNodeError,
  computeSync,
  fetchRepoNodes,
  nodeToGithub,
  renderEntryWithGithub,
  serialize,
  type Proposals,
} from "./sync";
import { NOW, makeEntry, makeNode } from "./sync-fixtures";

const run = (nodes: ReturnType<typeof makeNode>[], entries: ReturnType<typeof makeEntry>[]) =>
  computeSync({ nodes, entries, now: NOW });

describe("computeSync", () => {
  it("proposes a new public repo above the bar and creates no catalog file", () => {
    const { proposals, updates } = run([makeNode("fresh")], []);
    expect(proposals.newCandidates).toEqual([
      {
        repoName: "fresh",
        node_id: "node-fresh",
        description: "fresh description",
        homepage: null,
        lastCommitMonth: "2026-10",
      },
    ]);
    expect(updates).toEqual({});
  });

  it("does not propose a new repo below the bar", () => {
    const thin = makeNode("thin", { object: { byteSize: 100 } });
    expect(run([thin], []).proposals.newCandidates).toEqual([]);
  });

  it("aborts on one private node and no private name reaches the error text", () => {
    const nodes = [makeNode("ok"), makeNode("secret-vault-repo", { isPrivate: true })];
    let message = "";
    try {
      run(nodes, [makeEntry("ok")]);
    } catch (e) {
      expect(e).toBeInstanceOf(PrivateNodeError);
      message = String((e as Error).message);
    }
    expect(message).not.toBe("");
    expect(message).not.toContain("secret-vault-repo");
  });

  it("updates a renamed repo (same node_id) and lists the rename", () => {
    const entry = makeEntry("old-name", { nodeId: "node-moved" });
    const { proposals, updates } = run([makeNode("new-name", { id: "node-moved" })], [entry]);
    expect(updates["old-name"].repoName).toBe("new-name");
    expect(proposals.renamed).toEqual([{ slug: "old-name", from: "old-name", to: "new-name" }]);
  });

  it("proposes era earlier for an archived repo", () => {
    const { proposals } = run([makeNode("a", { isArchived: true })], [makeEntry("a")]);
    expect(proposals.archived).toEqual([{ slug: "a", era: "earlier" }]);
    expect(proposals.demotions).toEqual([]);
  });

  it("flags a cataloged repo that became a fork", () => {
    const { proposals } = run([makeNode("a", { isFork: true })], [makeEntry("a")]);
    expect(proposals.nowFork).toEqual(["a"]);
  });

  it("proposes demotion with every failing reason for a cataloged repo below the bar", () => {
    const weak = makeNode("weak", {
      object: { byteSize: 50 },
      defaultBranchRef: {
        target: { history: { totalCount: 2, nodes: [{ committedDate: "2025-01-01T00:00:00Z" }] } },
      },
    });
    const { proposals } = run([weak], [makeEntry("weak")]);
    expect(proposals.demotions).toHaveLength(1);
    expect(proposals.demotions[0].slug).toBe("weak");
    expect(proposals.demotions[0].reasons).toHaveLength(3);
  });

  it("proposes a cataloged public entry missing from the public set as stale, slug only", () => {
    const { proposals, updates } = run([], [makeEntry("gone")]);
    expect(proposals.stale).toEqual(["gone"]);
    expect(updates).toEqual({});
    expect(JSON.stringify(proposals.stale)).toBe(JSON.stringify(["gone"]));
  });

  it("reports a public repo named like a private entry by slug only and never lists it", () => {
    const priv = makeEntry("pace-server", { private: true, repoName: "hidden-real-name", nodeId: null });
    const { proposals } = run([makeNode("hidden-real-name")], [priv]);
    expect(proposals.privateNameMatches).toEqual(["pace-server"]);
    expect(proposals.newCandidates).toEqual([]);
    expect(JSON.stringify(proposals)).not.toContain("hidden-real-name");
  });

  it("never touches an entry with curated.private", () => {
    const priv = makeEntry("p", { private: true, nodeId: null, github: { description: "x", commitCount: 1 } });
    const { updates, proposals } = run([makeNode("p")], [priv]);
    expect(updates).toEqual({});
    expect(proposals.demotions).toEqual([]);
  });

  it("matches by repoName on the first run and records the node_id", () => {
    const entry = makeEntry("legacy", { nodeId: null, github: { node_id: undefined } });
    const { updates } = run([makeNode("legacy")], [entry]);
    expect(updates["legacy"].node_id).toBe("node-legacy");
  });

  it("produces no update for a stars-only change and no change for an unchanged run", () => {
    const node = { ...makeNode("a"), stargazerCount: 999 } as ReturnType<typeof makeNode>;
    const entries = [makeEntry("a")];
    const first = run([node], entries);
    expect(first.updates).toEqual({});
    expect(nodeToGithub(node, "duketopceo")).not.toHaveProperty("stargazerCount");
    const again = run([node], entries);
    expect(serialize(again.proposals)).toBe(serialize(first.proposals));
  });

  it("writes proposals deterministically regardless of node order", () => {
    const a = makeNode("alpha-app");
    const b = makeNode("beta-app");
    const one = serialize(run([a, b], []).proposals);
    const two = serialize(run([b, a], []).proposals);
    expect(one).toBe(two);
  });

  it("warns when the listed count is outside the target range", () => {
    expect(run([], []).proposals.rangeWarning).toContain("outside the 30-40 target");
    const entries = Array.from({ length: 31 }, (_, i) => makeEntry(`p${i}`));
    const nodes = entries.map((e) => makeNode(e.slug));
    expect(run(nodes, entries).proposals.rangeWarning).toBeNull();
  });
});

describe("renderEntryWithGithub", () => {
  it("preserves curated byte-for-byte and rewrites only github", () => {
    const entry = makeEntry("a", { curated: { tagline: "Keep  this — exactly" } });
    const raw = serialize(entry);
    const next = nodeToGithub(makeNode("a", { description: "changed upstream" }), "duketopceo");
    const out = renderEntryWithGithub(raw, next);
    expect(JSON.parse(out).github.description).toBe("changed upstream");
    const cut = (s: string) => s.slice(0, s.indexOf('"github"'));
    expect(cut(out)).toBe(cut(raw));
  });

  it("round-trips an unchanged github block to identical bytes", () => {
    const entry = makeEntry("a");
    const raw = serialize(entry);
    expect(renderEntryWithGithub(raw, entry.github)).toBe(raw);
  });

  it("throws when the result fails the schema", () => {
    const raw = serialize(makeEntry("a"));
    const bad = { ...nodeToGithub(makeNode("a"), "duketopceo"), repoName: "" };
    expect(() => renderEntryWithGithub(raw, bad)).toThrow();
  });
});

describe("fetchRepoNodes", () => {
  it("follows pagination and never puts the token in an error", async () => {
    const pages = [
      { hasNextPage: true, endCursor: "c1", nodes: [makeNode("a")] },
      { hasNextPage: false, endCursor: null, nodes: [makeNode("b")] },
    ];
    let i = 0;
    const fetchFn = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          repositoryOwner: {
            repositories: { pageInfo: pages[i], nodes: pages[i++].nodes },
          },
        },
      }),
    }));
    const nodes = await fetchRepoNodes({ token: "tok-123", owner: "duketopceo", fetchFn });
    expect(nodes.map((n) => n.name)).toEqual(["a", "b"]);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    const failing = vi.fn(async () => ({ ok: false, status: 401, json: async () => ({}) }));
    await expect(fetchRepoNodes({ token: "tok-123", owner: "x", fetchFn: failing })).rejects.toThrow(
      /HTTP 401/,
    );
    await fetchRepoNodes({ token: "tok-123", owner: "x", fetchFn: failing }).catch((e) =>
      expect(String(e.message)).not.toContain("tok-123"),
    );
  });
});

describe("proposals schema", () => {
  it("is satisfied by an empty result", () => {
    const empty: Proposals = run([], []).proposals;
    expect(Object.keys(empty).sort()).toEqual(
      ["archived", "demotions", "newCandidates", "nowFork", "privateNameMatches", "rangeWarning", "renamed", "stale"],
    );
  });
});
