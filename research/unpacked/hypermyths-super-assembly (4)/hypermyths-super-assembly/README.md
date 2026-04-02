# HyperMyths Super Assembly

Computation-market-first local monorepo for:

- **AsiMOG**: private brain, public brain, backend exchange policy
- **ClawMOG**: frontend shell, operator surfaces, public market UI
- **superbrain-api**: live local HTTP API for the Rust exchange loop
- **superbrain-tui**: keyboard-first operator console
- **superbrain-cli**: local inspection and export commands

## Repo layout

```text
apps/webgui                 # Next.js live market console
crates/superbrain-core      # market types, engine, exchange loop
crates/superbrain-cli       # CLI inspection/export
crates/superbrain-tui       # terminal operator console
crates/superbrain-api       # local HTTP API for web + tooling
```

## Install on your desktop

You need:

- Rust via `rustup`
- Node.js 20+
- pnpm
- VS Code
- rust-analyzer extension
- Git

## Run the Rust CLI

From the repo root:

```bash
cargo check
cargo run -p superbrain-cli -- --whitelist data/solana_whitelist.example.json status
cargo run -p superbrain-cli -- --whitelist data/solana_whitelist.example.json loop --ticks 5
```

## Run the local API

```bash
cargo run -p superbrain-api
```

This starts the local service on:

```text
http://127.0.0.1:8787
```

## Run the TUI

In another terminal:

```bash
cargo run -p superbrain-tui
```

Press `q` to quit.

## Run the web GUI

In another terminal:

```bash
cd apps/webgui
pnpm install
pnpm dev
```

Then open:

```text
http://localhost:3000
```

The web app reads from the local Rust API by default.

## Important gotchas

- Put **public Solana addresses only** in the whitelist file. Never private keys.
- Start the **API before the web GUI**, or the web UI will show a connection error.
- I could not compile-test Rust in this container, so run `cargo check` first on your machine.
