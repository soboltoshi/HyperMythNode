#!/usr/bin/env bash
set -euo pipefail

echo "== Rust fmt check =="
cargo fmt --all --check || true

echo "== Rust clippy =="
cargo clippy --workspace --all-targets || true

echo "== Web GUI install hint =="
echo "cd apps/webgui && pnpm install && pnpm dev"
