#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Starting superbrain-api on http://127.0.0.1:8787"
cargo run -p superbrain-api &
API_PID=$!

cleanup() {
  kill "$API_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 2

echo "Starting Next.js web GUI on http://localhost:3000"
cd apps/webgui
pnpm install
pnpm dev
