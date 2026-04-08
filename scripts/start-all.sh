#!/usr/bin/env bash
# Start all HyperMythsX services in the correct order.
# Usage: bash scripts/start-all.sh
#
# Services:
#   1. Kernel    (Rust)   — :8787 — canonical truth
#   2. Hermes    (Node)   — :8799 — agent orchestration + task executor
#   3. Companion (Node)   — :8798 — voice bridge + desktop shell
#   4. Web       (Next.js)— :3000 — operator console

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Load env if present
if [ -f .env ]; then
  set -a; source .env; set +a
fi

echo "=== HyperMythsX Service Launcher ==="
echo ""

# 1. Build and start kernel
echo "[1/4] Starting kernel (lx-core) on :8787..."
cargo build -p lx-core --release 2>&1 | tail -3
./target/release/lx-core &
KERNEL_PID=$!
echo "  kernel PID: $KERNEL_PID"
sleep 1

# 2. Start Hermes runtime (includes task executor)
echo "[2/4] Starting Hermes runtime on :8799..."
npm run dev:hermes &
HERMES_PID=$!
echo "  hermes PID: $HERMES_PID"
sleep 1

# 3. Start desktop companion
echo "[3/4] Starting companion on :8798..."
npm run dev:companion &
COMPANION_PID=$!
echo "  companion PID: $COMPANION_PID"
sleep 1

# 4. Start web operator
echo "[4/4] Starting web operator on :3000..."
npm run dev:web &
WEB_PID=$!
echo "  web PID: $WEB_PID"

echo ""
echo "=== All services started ==="
echo "  Kernel:    http://127.0.0.1:8787"
echo "  Hermes:    http://127.0.0.1:8799"
echo "  Companion: http://127.0.0.1:8798"
echo "  Web:       http://127.0.0.1:3000"
echo ""
echo "Press Ctrl+C to stop all services."

# Wait and cleanup
trap "echo 'Stopping...'; kill $KERNEL_PID $HERMES_PID $COMPANION_PID $WEB_PID 2>/dev/null; exit 0" INT TERM
wait
