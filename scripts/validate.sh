#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "== Go formatting and tests =="
UNFORMATTED="$(gofmt -l "$ROOT/backend")"
[[ -z "$UNFORMATTED" ]] || { echo "ERROR: gofmt required:"; echo "$UNFORMATTED"; exit 1; }
(cd "$ROOT/backend" && go test ./... && go vet ./...)
echo "== React install, lint, and build =="
(cd "$ROOT/frontend" && npm install && npm run lint && npm run build)
echo "PASS: all validation completed"
