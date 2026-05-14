#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

: "${CLOUDFLARE_API_TOKEN:?Missing CLOUDFLARE_API_TOKEN — add it to apps/web/.env.local}"
: "${CLOUDFLARE_ACCOUNT_ID:?Missing CLOUDFLARE_ACCOUNT_ID — add it to apps/web/.env.local}"

PROJECT_NAME="${PAGES_PROJECT_NAME:-skill-recorder}"
BRANCH="${1:-main}"

export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID

if ! pnpm exec wrangler pages project list 2>/dev/null | grep -qw "$PROJECT_NAME"; then
  echo "▸ Project '$PROJECT_NAME' not found, creating..."
  pnpm exec wrangler pages project create "$PROJECT_NAME" --production-branch=main
fi

echo "▸ Building apps/web..."
pnpm build

if [ -f public/_redirects ]; then
  cp public/_redirects out/_redirects
fi
if [ -f public/_headers ]; then
  cp public/_headers out/_headers
fi

COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "")
COMMIT_MSG=$(git log -1 --pretty=%s 2>/dev/null || echo "manual deploy")

echo "▸ Deploying to Cloudflare Pages (project=$PROJECT_NAME branch=$BRANCH)..."
DEPLOY_ARGS=(pages deploy out --project-name="$PROJECT_NAME" --branch="$BRANCH")
[ -n "$COMMIT_SHA" ] && DEPLOY_ARGS+=(--commit-hash="$COMMIT_SHA")
[ -n "$COMMIT_MSG" ] && DEPLOY_ARGS+=(--commit-message="$COMMIT_MSG")

pnpm exec wrangler "${DEPLOY_ARGS[@]}"
