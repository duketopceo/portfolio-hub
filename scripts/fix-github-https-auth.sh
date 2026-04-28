#!/usr/bin/env bash
# On the Swarm manager: find why `git ls-remote https://github.com/...` sends bad auth.
# Run from repo root: bash scripts/fix-github-https-auth.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== 1) origin URL (must NOT contain @ or token) ==="
git remote -v || true

echo ""
echo "=== 2) Any credential / github / insteadOf / askpass in git config ==="
(git config --list --show-origin 2>/dev/null || true) | grep -iE 'credential|github|insteadof|extraheader|askpass|AUTHORIZATION' || echo "(none matched)"

echo ""
echo "=== 3) ~/.netrc (libcurl reads this for git https — bad lines break public fetch) ==="
if [[ -f "$HOME/.netrc" ]]; then
  grep -n 'machine github.com' "$HOME/.netrc" 2>/dev/null || echo "(no github.com machine block)"
else
  echo "(no ~/.netrc)"
fi

echo ""
echo "=== 4) Env that can affect Git/curl ==="
env | grep -iE '^GIT_|^CURL_' || true

echo ""
echo "=== 5) Try unauthenticated HTTPS to GitHub (should return HTTP 200 or 301) ==="
curl -sS -o /dev/null -w "curl https://github.com → HTTP %{http_code}\n" "https://github.com/duketopceo/portfolio-hub" || true

echo ""
echo "=== FIX: strip local repo auth overrides, reset origin, clear netrc github block ==="
git remote set-url origin "https://github.com/duketopceo/portfolio-hub.git"
# Remove common accidental auth injection in THIS repo only
git config --local --unset-all http.https://github.com/.extraheader 2>/dev/null || true
git config --local --unset-all credential.helper 2>/dev/null || true
git config --local --unset-all url."https://*@github.com/".insteadOf 2>/dev/null || true

echo ""
echo "=== 6) Retry ls-remote (no helper, no ~/.netrc for this call) ==="
# http.useNetrc=false stops libcurl from sending machine github.com login from ~/.netrc
GIT_TERMINAL_PROMPT=0 GIT_ASKPASS= git \
  -c credential.helper= \
  -c http.useNetrc=false \
  ls-remote origin HEAD

echo ""
echo "OK — if you see a commit SHA above, run: ./scripts/cluster-deploy.sh"
