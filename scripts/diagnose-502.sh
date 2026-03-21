#!/usr/bin/env bash
# Lengthy 502 / origin diagnostic for Docker Swarm + Traefik + portfolio-hub + Cloudflare path.
# Run on a Swarm manager (SSH to cluster-1-master) or any host with docker context pointed at the cluster.
#
# Usage:
#   chmod +x scripts/diagnose-502.sh
#   ./scripts/diagnose-502.sh
#   DOMAIN=example.com PUBLIC_URL=https://example.com/api/health ./scripts/diagnose-502.sh
#   STACK_NAME=portfolio SERVICE_NAME=portfolio_portfolio ./scripts/diagnose-502.sh
#
# Optional: export CLOUDFLARE_API_TOKEN and run from repo root to also invoke scripts/audit-cloudflare.sh
#
set -u

STACK_NAME="${STACK_NAME:-portfolio}"
SERVICE_NAME="${SERVICE_NAME:-${STACK_NAME}_portfolio}"
DOMAIN="${DOMAIN:-luke-the-duke.com}"
PUBLIC_URL="${PUBLIC_URL:-https://${DOMAIN}/api/health}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

hr() { printf '\n%s\n' "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }
sec() { hr; printf '📌 %s\n\n' "$1"; }

run() {
  printf '$ %s\n' "$*"
  bash -c "$1" 2>&1 || printf '(exit %s)\n' "$?"
}

sec "502 diagnostic bundle — $(date -u +%Y-%m-%dT%H:%M:%SZ) UTC"
echo "HOSTNAME=$(hostname -f 2>/dev/null || hostname)"
echo "USER=$(whoami)"
echo "STACK_NAME=$STACK_NAME  SERVICE_NAME=$SERVICE_NAME  DOMAIN=$DOMAIN"
echo "PUBLIC_URL=$PUBLIC_URL"
echo ""

# ── Docker / Swarm ───────────────────────────────────────────────────────────
sec "1) Docker daemon & Swarm role"
run "docker version --format '{{.Server.Version}}' 2>/dev/null || docker version"
run "docker info 2>/dev/null | head -40"
run "docker node ls 2>/dev/null || echo 'Not in Swarm mode or no permission'"

# ── Networks ─────────────────────────────────────────────────────────────────
sec "2) Overlay networks (expect traefik-public for Traefik ↔ app)"
run "docker network ls --filter driver=overlay --format 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}'"
run "docker network inspect traefik-public --format '{{json .IPAM.Config}}' 2>/dev/null || echo 'traefik-public: not found on this host'"

# ── Services summary ─────────────────────────────────────────────────────────
sec "3) Stack services (portfolio stack)"
run "docker stack services \"$STACK_NAME\" 2>/dev/null || echo 'Stack not deployed or name mismatch'"

sec "4) Service inspect — replicas, image, update state"
if docker service inspect "$SERVICE_NAME" &>/dev/null; then
  run "docker service inspect \"$SERVICE_NAME\" --format 'Name: {{.Spec.Name}}'"
  run "docker service inspect \"$SERVICE_NAME\" --format 'Replicas: {{if .Spec.Mode.Replicated}}{{.Spec.Mode.Replicated.Replicas}}{{else}}n/a{{end}}'"
  run "docker service inspect \"$SERVICE_NAME\" --format 'Image: {{.Spec.TaskTemplate.ContainerSpec.Image}}'"
  run "docker service inspect \"$SERVICE_NAME\" --format 'Update: {{if .UpdateStatus}}{{.UpdateStatus.State}} {{.UpdateStatus.Message}}{{else}}n/a{{end}}'"
else
  echo "Service $SERVICE_NAME not found."
fi

sec "5) Service tasks (want Running — not Rejected / Failed)"
run "docker service ps \"$SERVICE_NAME\" --no-trunc 2>/dev/null | head -30"

sec "6) Traefik-related services (if named *traefik*)"
run "docker service ls --format '{{.Name}}\t{{.Replicas}}' 2>/dev/null | grep -i traefik || echo 'No service name matching traefik'"

# ── Running containers ───────────────────────────────────────────────────────
sec "7) Portfolio task containers (docker ps)"
run "docker ps -a --filter name=\"${SERVICE_NAME}\" --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}\t{{.Ports}}'"

PORTFOLIO_CID=$(docker ps -q -f name="${SERVICE_NAME}" | head -1)
echo "First portfolio container id: ${PORTFOLIO_CID:-<none>}"

# ── Per-container inspect ─────────────────────────────────────────────────────
if [[ -n "${PORTFOLIO_CID:-}" ]]; then
  sec "8) Inspect first portfolio container — networks & health"
  run "docker inspect \"$PORTFOLIO_CID\" --format '{{json .State.Health}}' 2>/dev/null | head -c 800; echo"
  run "docker inspect \"$PORTFOLIO_CID\" --format 'Networks: {{range \$k, \$v := .NetworkSettings.Networks}}{{\$k}}={{\$v.IPAddress}} {{end}}'"
fi

# ── App liveness (inside task) ─────────────────────────────────────────────
sec "9) Liveness INSIDE portfolio task → http://127.0.0.1:3000/api/health (gold standard)"
if [[ -n "${PORTFOLIO_CID:-}" ]]; then
  run "docker exec \"$PORTFOLIO_CID\" wget -qO- --timeout=5 http://127.0.0.1:3000/api/health 2>&1"
  run "docker exec \"$PORTFOLIO_CID\" wget -qS --timeout=3 --spider http://127.0.0.1:3000/api/repos 2>&1 | head -5"
else
  echo "Skip: no running portfolio container."
fi

# ── VIP reachable from portfolio task (overlay routing) ─────────────────────
sec "9b) From portfolio task → service VIP (proves overlay routing to VIP)"
if [[ -n "${PORTFOLIO_CID:-}" ]]; then
  VIP_P=$(docker service inspect "$SERVICE_NAME" --format '{{(index .Endpoint.VirtualIPs 0).Addr}}' 2>/dev/null | cut -d/ -f1)
  if [[ -n "${VIP_P:-}" ]]; then
    run "docker exec \"$PORTFOLIO_CID\" wget -qO- --timeout=5 \"http://${VIP_P}:3000/api/health\" 2>&1"
  else
    echo "Skip: no VIP."
  fi
else
  echo "Skip: no portfolio container."
fi

# ── Service VIP + Traefik namespace curl ─────────────────────────────────────
sec "10) Swarm service VIP(s) for $SERVICE_NAME"
run "docker service inspect \"$SERVICE_NAME\" --format '{{json .Endpoint.VirtualIPs}}' 2>/dev/null | python3 -m json.tool 2>/dev/null || docker service inspect \"$SERVICE_NAME\" --format '{{json .Endpoint.VirtualIPs}}'"

VIP=$(docker service inspect "$SERVICE_NAME" --format '{{(index .Endpoint.VirtualIPs 0).Addr}}' 2>/dev/null | cut -d/ -f1)
echo "First VIP (for curl via Traefik netns): ${VIP:-<none>}"

TID=$(docker ps -q -f name=traefik | head -1)
echo "First Traefik container id: ${TID:-<none>}"

sec "11) Optional: curl VIP from Traefik’s network namespace (no Swarm DNS)"
if [[ -n "${VIP:-}" && -n "${TID:-}" ]]; then
  if docker run --rm --network "container:$TID" curlimages/curl:latest -sS -o /dev/null -w 'HTTP %{http_code}\n' --max-time 8 "http://${VIP}:3000/api/health" 2>&1; then
    :
  else
    echo "(curl via Traefik netns failed — Traefik often NOT on traefik-public: attach Traefik to the same overlay as portfolio, or use Swarm service for Traefik)"
  fi
else
  echo "Skip: need VIP and Traefik container."
fi

sec "11b) Traefik vs portfolio: both on traefik-public? (must match for routing)"
TR_NAME_EARLY=$(docker ps --filter name=traefik --format '{{.Names}}' | head -1)
if [[ -n "${TR_NAME_EARLY:-}" ]]; then
  run "docker inspect \"$TR_NAME_EARLY\" --format 'Traefik networks: {{range \$k, \$v := .NetworkSettings.Networks}}{{\$k}}={{\$v.IPAddress}} {{end}}'"
  if [[ -n "${PORTFOLIO_CID:-}" ]]; then
    run "docker inspect \"$PORTFOLIO_CID\" --format 'Portfolio task networks: {{range \$k, \$v := .NetworkSettings.Networks}}{{\$k}}={{\$v.IPAddress}} {{end}}'"
  fi
  echo "    If Traefik is missing traefik-public but portfolio has it → 502 / LB unhealthy until Traefik joins that overlay."
else
  echo "No Traefik container found."
fi

# ── Traefik container ────────────────────────────────────────────────────────
sec "12) Traefik containers (docker ps)"
run "docker ps -a --filter name=traefik --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}' | head -20"

if [[ -n "${TID:-}" ]]; then
  sec "13) Traefik container resolv.conf (why hostname curl may fail)"
  run "docker exec \"$TID\" cat /etc/resolv.conf 2>/dev/null | head -20 || echo 'Cannot exec into Traefik (host network or minimal image)'"
fi

# ── Logs (recent) ────────────────────────────────────────────────────────────
sec "14) Portfolio service logs (last 80 lines)"
run "docker service logs \"$SERVICE_NAME\" --tail 80 2>&1"

sec "15) Traefik logs — filtered (portfolio / backend / error / 502)"
TR_NAME=$(docker ps --filter name=traefik --format '{{.Names}}' | head -1)
if [[ -n "${TR_NAME:-}" ]]; then
  FILT=$(docker logs "$TR_NAME" --tail 200 2>&1 | grep -iE 'portfolio|backend|error|502|bad gateway|health' | tail -40 || true)
  if [[ -n "$FILT" ]]; then
    echo "$FILT"
  else
    echo "(no matching lines — showing raw tail below)"
  fi
  sec "15b) Traefik logs — raw tail (last 50 lines)"
  run "docker logs \"$TR_NAME\" --tail 50 2>&1"
else
  echo "No traefik container found for logs."
fi

# ── External: public URL ─────────────────────────────────────────────────────
sec "16) External HTTPS probe (Cloudflare → origin path)"
run "curl -sS -o /tmp/502-diag-body.txt -w 'HTTP %{http_code} | time_total=%{time_total}s | ssl_verify=%{ssl_verify_result}\n' --max-time 20 \"$PUBLIC_URL\" 2>&1 || true"
if [[ -f /tmp/502-diag-body.txt ]]; then
  echo "Response body (first 500 chars):"
  head -c 500 /tmp/502-diag-body.txt; echo
  rm -f /tmp/502-diag-body.txt
fi

sec "17) DNS: resolve apex & www (from this host)"
if command -v dig >/dev/null 2>&1; then
  run "dig +short \"$DOMAIN\" A"
  run "dig +short \"www.$DOMAIN\" A"
  run "dig +short \"$DOMAIN\" AAAA"
  echo "    If www is empty, add www CNAME or A in Cloudflare (Host() matches www in docker-compose)."
elif command -v getent >/dev/null 2>&1; then
  run "getent hosts \"$DOMAIN\" || true"
else
  echo "Install dig or use getent for DNS checks."
fi

# ── Node resources (quick) ────────────────────────────────────────────────────
sec "18) Host / disk (manager node)"
run "uname -a"
run "df -h / 2>/dev/null | head -5"
run "free -h 2>/dev/null || true"
run "docker system df 2>/dev/null || true"

# ── Cloudflare audit script (optional) ─────────────────────────────────────────
sec "19) Cloudflare API audit (if CLOUDFLARE_API_TOKEN is set)"
if [[ -n "${CLOUDFLARE_API_TOKEN:-}" && -x "$ROOT/scripts/audit-cloudflare.sh" ]]; then
  (cd "$ROOT" && DOMAIN="$DOMAIN" ./scripts/audit-cloudflare.sh) 2>&1 || true
else
  echo "Skip: set CLOUDFLARE_API_TOKEN or run: $ROOT/scripts/audit-cloudflare.sh"
  echo "      (read-only token: Zone Read, DNS Read, Zone Settings Read)"
fi

# ── Interpretation cheat-sheet ───────────────────────────────────────────────
sec "20) Quick read of results"
cat <<'EOF'
• (9) App OK on 127.0.0.1 inside task but (16) public 502 → Traefik ↔ backend, TLS, or router — not Next.js.
• (9b) OK but (11) times out → Traefik likely not on traefik-public; join Traefik to the same overlay as portfolio.
• (9) fails → fix app/Swarm first.
• Traefik LB healthcheck → all servers down if Traefik cannot reach VIP:3000; label traefik.docker.network=traefik-public on the app is not enough if Traefik itself is off-overlay.
• www: if dig www is empty, add DNS for www (see docker-compose Host() rules).
• SSL: Cloudflare Full (strict) needs valid cert on Traefik for that hostname.
EOF

hr
echo "Done. Save full output:  $0 2>&1 | tee /tmp/502-diagnostic-$(date +%Y%m%d-%H%M%S).log"
echo ""
