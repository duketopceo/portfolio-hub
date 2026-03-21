#!/usr/bin/env bash
# Cluster deploy (Docker Swarm): sync git to origin/main, rebuild image, push to registry,
# stack deploy, rolling update. Run on the manager from the repo root (e.g. ~/portfolio-hub).
#
# Multi-node Swarm: every worker must be able to pull the image. After `docker compose build`
# the image exists only on this node — you MUST `docker push` to GHCR (or another registry)
# so workers (e.g. cluster2) can run tasks. Otherwise: "No such image: ghcr.io/.../latest".
#
# Prerequisites:
#   - .env with GITHUB_TOKEN next to docker-compose.yml
#   - traefik-public network exists
#   - docker login ghcr.io (PAT with write:packages) on the manager before first push
#
# Usage:
#   chmod +x scripts/cluster-deploy.sh
#   ./scripts/cluster-deploy.sh
#
# Skip registry push (only if all replicas run on this node and image is already loaded):
#   SKIP_PUSH=1 ./scripts/cluster-deploy.sh
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
SKIP_PUSH="${SKIP_PUSH:-0}"

echo "==> portfolio-hub cluster deploy"
echo "    ROOT=$ROOT"
echo "    STACK_NAME=$STACK_NAME  IMAGE=$IMAGE  SKIP_PUSH=$SKIP_PUSH"

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

if [[ "$SKIP_PUSH" == "1" ]]; then
  echo "==> SKIP_PUSH=1 — not pushing to registry (multi-node clusters will fail unless every node already has this image)"
else
  echo "==> docker push (required on multi-node Swarm so workers can pull the image)"
  if ! docker push "$IMAGE"; then
    echo "" >&2
    echo "error: docker push failed. Workers cannot run tasks without the image in the registry." >&2
    echo "  1. docker login ghcr.io -u YOUR_GITHUB_USER -p YOUR_PAT" >&2
    echo "     (PAT needs read:packages + write:packages for push)" >&2
    echo "  2. Or let GitHub Actions build/push, then only: docker pull $IMAGE && docker stack deploy ..." >&2
    echo "  3. Or temporarily SKIP_PUSH=1 and set replicas=1 + manager placement (not recommended)" >&2
    exit 1
  fi
fi

echo "==> stack deploy (injects GITHUB_TOKEN from .env into service spec)"
docker stack deploy -c docker-compose.yml "$STACK_NAME"

echo "    SERVICE_NAME=$SERVICE_NAME"

echo "==> wait for swarm to settle (avoids 'update out of sequence')"
sleep 8

echo "==> rolling update (pull new digest on nodes; --with-registry-auth forwards login to workers)"
success=0
for attempt in 1 2 3 4 5; do
  set +e
  out=$(docker service update --force --image "$IMAGE" --with-registry-auth "$SERVICE_NAME" 2>&1)
  ec=$?
  set -e
  if [[ $ec -eq 0 ]]; then
    success=1
    echo "    service update ok (attempt $attempt)"
    break
  fi
  if echo "$out" | grep -q "update out of sequence"; then
    echo "    update out of sequence, retry in 6s ($attempt/5)..."
    sleep 6
    continue
  fi
  echo "$out" >&2
  exit 1
done
if [[ "$success" != "1" ]]; then
  echo "error: service update failed after 5 attempts" >&2
  exit 1
fi

echo "==> done"
docker service ps "$SERVICE_NAME" --no-trunc 2>/dev/null | head -8 || true
