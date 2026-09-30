#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$ROOT/.env.availability.local" ]; then
  set -a
  . "$ROOT/.env.availability.local"
  set +a
fi
trap 'kill 0 2>/dev/null || true' EXIT INT TERM
(cd "$ROOT/backend" && go run ./cmd/local) &
(cd "$ROOT/frontend" && npm run dev) &
wait
