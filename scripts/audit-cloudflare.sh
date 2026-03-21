#!/usr/bin/env bash
# Audit Cloudflare zone + DNS + SSL settings for debugging 502 / origin issues.
# Uses the official HTTP API (curl). Optional: cloudflared / wrangler if installed.
#
# Prerequisites:
#   - curl
#   - python3 (for JSON — no jq required)
#
# Token (create in Cloudflare Dashboard → My Profile → API Tokens):
#   Minimum: Zone → Zone Read, DNS Read, Zone Settings Read
#
# Usage:
#   export CLOUDFLARE_API_TOKEN='...'
#   ./scripts/audit-cloudflare.sh
#   DOMAIN=example.com ./scripts/audit-cloudflare.sh
#
# Or put CLOUDFLARE_API_TOKEN in repo .env (not committed with real secrets).
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOMAIN="${DOMAIN:-luke-the-duke.com}"
API="https://api.cloudflare.com/client/v4"

if [[ -f "$ROOT/.env" ]] && [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "error: set CLOUDFLARE_API_TOKEN (export or add to .env)" >&2
  echo "  Dashboard → My Profile → API Tokens → Create Token (Zone DNS Read + Zone Read + Zone Settings Read)" >&2
  exit 1
fi

cf_curl() {
  local path="$1"
  shift
  curl -fsS "${API}${path}" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    "$@"
}

echo "==> Cloudflare audit — DOMAIN=${DOMAIN}"
echo ""

echo "==> Zone"
ZONE_JSON=$(cf_curl "/zones?name=${DOMAIN}")
if ! echo "$ZONE_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('success') and d.get('result') else 1)"; then
  echo "error: zones?name=${DOMAIN} failed or not found" >&2
  echo "$ZONE_JSON" | python3 -m json.tool 2>/dev/null || echo "$ZONE_JSON"
  exit 1
fi

ZONE_ID=$(echo "$ZONE_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); r=d.get('result') or []; print(r[0]['id'] if r else '')")
ZONE_NAME=$(echo "$ZONE_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); r=d.get('result') or []; print(r[0].get('name','') if r else '')")
STATUS=$(echo "$ZONE_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); r=d.get('result') or []; print(r[0].get('status','') if r else '')")
PAUSED=$(echo "$ZONE_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); r=d.get('result') or []; print(r[0].get('paused','') if r else '')")
echo "    zone_id:   ${ZONE_ID}"
echo "    name:      ${ZONE_NAME}"
echo "    status:    ${STATUS}"
echo "    paused:    ${PAUSED}   (if true, Cloudflare proxy/DNS features are off)"
echo ""

echo "==> DNS records (apex + www + common origin patterns)"
REC_JSON=$(cf_curl "/zones/${ZONE_ID}/dns_records?per_page=100")
export DOMAIN
echo "$REC_JSON" | python3 -c '
import json, sys, os
d = json.load(sys.stdin)
dom = (os.environ.get("DOMAIN") or "").lower().rstrip(".")
if not d.get("success"):
    print("    (API error)", d)
    sys.exit(0)
rows = []
for r in d.get("result") or []:
    name = (r.get("name") or "").lower().rstrip(".")
    typ = r.get("type") or ""
    content = r.get("content") or ""
    proxied = r.get("proxied")
    ttl = r.get("ttl")
    if typ in ("A", "AAAA", "CNAME", "TXT") and (name == dom or name.endswith("." + dom)):
        rows.append((name, typ, content, proxied, ttl))
rows.sort(key=lambda x: (x[0], x[1]))
if not rows:
    print("    (no matching records in first 100 — check zone name)")
for name, typ, content, proxied, ttl in rows:
    px = "proxied" if proxied else "DNS only"
    print(f"    {name:32} {typ:6} {content:40} {px:10} ttl={ttl}")
'
echo ""
echo "    Tip: Orange-cloud (proxied) A/AAAA must point to an origin that serves HTTPS on 443."
echo "    If origin is wrong or down → 502 at the edge."
echo ""

echo "==> Zone settings (SSL / HTTPS — 502 often ties to origin TLS vs mode)"
SETTINGS_JSON=$(cf_curl "/zones/${ZONE_ID}/settings")
echo "$SETTINGS_JSON" | python3 <<'PY'
import json, sys

want = {"ssl", "always_use_https", "min_tls_version", "automatic_https_rewrites", "tls_1_3", "security_level"}
d = json.load(sys.stdin)
if not d.get("success"):
    print("    (API error)", d.get("errors"))
    sys.exit(0)
for item in d.get("result") or []:
    iid = item.get("id") or ""
    if iid in want:
        print(f"    {iid}: {item.get('value')}")
PY
echo ""
echo "    ssl values: off | flexible | full | strict"
echo "    Full (strict) requires a valid cert on the origin (e.g. Traefik LE)."
echo ""

if command -v cloudflared >/dev/null 2>&1; then
  echo "==> cloudflared (tunnels — if you use Tunnel instead of public A record)"
  cloudflared tunnel list 2>/dev/null || echo "    (tunnel list failed — login or no tunnels)"
  echo ""
else
  echo "==> cloudflared not in PATH (skip tunnel audit; install if you use Cloudflare Tunnel)"
  echo ""
fi

if command -v wrangler >/dev/null 2>&1; then
  echo "==> wrangler whoami (Workers/Pages account — optional)"
  wrangler whoami 2>/dev/null || echo "    (wrangler whoami failed — not logged in or no token)"
  echo ""
fi

echo "==> Quick external checks (from this machine)"
ORIGIN="https://${DOMAIN}/api/health"
HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "$ORIGIN" 2>/dev/null || echo "000")
echo "    GET ${ORIGIN}"
echo "    HTTP ${HTTP_CODE}  (502 = edge reached origin but bad response; check Traefik/backend)"
echo ""
echo "Done. Cross-check: Traefik Host() rule must match ${DOMAIN} / www — see docker-compose.yml and docs/AUDIT-502.md"
