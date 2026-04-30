# Obsidian Vault — AI Brain Mirror

Local-first markdown mirror of the [[🧠 AI Brain]] Notion workspace.

## Location

```
~/Documents/Obsidian Vault/
```

## Structure

```
AI Brain/
  Session Log/          ← Every meaningful dev session, append-only
  Decisions/            ← Immutable architectural + business decisions
  Projects/             ← Live project state (Stratum, Podcast, Bartlett)
  People/               ← Contacts, collaborators, investors
  Rules/                ← Agent behavior constraints
  Learnings/            ← Patterns, anti-patterns, insights
  Resources/            ← Bookmarks, tools, templates

Luke the Duke Show/
  Episode Archive/      ← All episodes (EP001–current)
  Show Standards.md     ← Locked episode structure
  Topic Bank.md         ← Research library with heat ratings

Dashboard/
  Stratum What Shipped.md  ← Episode-to-episode feature tracking

_Templates/
  Episode Template.md   ← Blank episode for new recordings
```

## MCP Integration

The vault uses `obsidian-local-rest-api` plugin for external tool access.

- **Port:** 27124 (secure) / 27123 (insecure for local dev)
- **Plugin:** `obsidian-local-rest-api` (installed)
- **API Key:** See vault `.obsidian/plugins/obsidian-local-rest-api/data.json`

## Notion Sync Strategy

This vault is a **local-first mirror** of the Notion AI Brain:

- **Local-first:** Works offline
- **Markdown-native:** No block-based editing
- **Hyperlinked:** Uses Obsidian `[[wikilinks]]` for cross-referencing
- **Git-backed:** Sync via `obsidian-git` plugin

## Quick Links

- [Show Standards](obsidian://open?vault=Obsidian%20Vault&file=Luke%20the%20Duke%20Show%2FShow%20Standards)
- [Topic Bank](obsidian://open?vault=Obsidian%20Vault&file=Luke%20the%20Duke%20Show%2FTopic%20Bank)
- [Stratum What Shipped](obsidian://open?vault=Obsidian%20Vault&file=Dashboard%2FStratum%20What%20Shipped)
