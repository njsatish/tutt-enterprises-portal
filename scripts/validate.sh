#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
(cd "$ROOT/backend" && gofmt -w . && go test ./...)
(cd "$ROOT/frontend" && npm ci && npm run lint && npm run build)
echo "PASS: backend tests and frontend validation completed"
