#!/usr/bin/env bash
set -euo pipefail

echo "== Rust fmt =="
cargo fmt --all -- --check

echo "== Rust clippy =="
cargo clippy --workspace --all-targets -- -D warnings

echo "== Rust tests =="
cargo test --workspace
