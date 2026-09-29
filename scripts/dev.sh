#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
command -v go >/dev/null || { echo "ERROR: Go is required"; exit 1; }
command -v npm >/dev/null || { echo "ERROR: npm is required"; exit 1; }
cleanup() { [[ -n "${GO_PID:-}" ]] && kill "$GO_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
(cd "$ROOT/backend" && go run ./cmd/local) &
GO_PID=$!
cd "$ROOT/frontend"
[[ -d node_modules ]] || npm install
npm run dev
