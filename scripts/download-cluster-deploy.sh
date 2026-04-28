#!/usr/bin/env bash
# Overwrite scripts/cluster-deploy.sh from GitHub (private repo: raw.githubusercontent.com 404).
# Reads GITHUB_TOKEN from .env in repo root or from env. Needs repo scope on the PAT.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
if [[ -z "$TOKEN" ]]; then
  echo "error: set GITHUB_TOKEN in .env or export GH_TOKEN (PAT with repo read)" >&2
  exit 1
fi
OUT="$ROOT/scripts/cluster-deploy.sh"
curl -fsSL \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/vnd.github.v3.raw" \
  -o "$OUT" \
  "https://api.github.com/repos/duketopceo/portfolio-hub/contents/scripts/cluster-deploy.sh?ref=main"
chmod +x "$OUT"
echo "wrote $OUT ($(wc -c < "$OUT") bytes)"
