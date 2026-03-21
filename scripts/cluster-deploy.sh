#!/usr/bin/env bash
# Cluster deploy (Docker Swarm): sync git to origin/main, rebuild image, apply stack
# env + rolling update. Run on the manager from the repo root (e.g. ~/portfolio-hub).
#
# Prerequisites: .env with GITHUB_TOKEN (and optional GITHUB_USER) next to docker-compose.yml;
# traefik-public network exists.
#
# Usage:
#   chmod +x scripts/cluster-deploy.sh
#   ./scripts/cluster-deploy.sh
#
# Override if needed:
#   STACK_NAME=portfolio SERVICE_NAME=portfolio_portfolio ./scripts/cluster-deploy.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

STACK_NAME="${STACK_NAME:-portfolio}"
IMAGE="${IMAGE:-ghcr.io/duketopceo/portfolio-hub:latest}"
# Compose service is "portfolio" → Swarm name is "<stack>_portfolio"
SERVICE_NAME="${SERVICE_NAME:-${STACK_NAME}_portfolio}"

echo "==> portfolio-hub cluster deploy"
echo "    ROOT=$ROOT"
echo "    STACK_NAME=$STACK_NAME  IMAGE=$IMAGE"

if [[ ! -f docker-compose.yml ]]; then
  echo "error: docker-compose.yml not found (run from repo root)" >&2
  exit 1
fi

echo "==> git: fetch + hard reset to origin/main (discard local commits on server)"
git fetch origin
git reset --hard "origin/main"
echo "    HEAD=$(git rev-parse --short HEAD) $(git log -1 --oneline)"

echo "==> docker compose build (loads .env for GITHUB_TOKEN build-arg)"
docker compose build portfolio

echo "==> stack deploy (injects GITHUB_TOKEN from .env into service spec)"
docker stack deploy -c docker-compose.yml "$STACK_NAME"

echo "    SERVICE_NAME=$SERVICE_NAME"

echo "==> force rolling update to local :latest image"
docker service update --force --image "$IMAGE" "$SERVICE_NAME"

echo "==> done"
docker service ps "$SERVICE_NAME" --no-trunc 2>/dev/null | head -6 || true
