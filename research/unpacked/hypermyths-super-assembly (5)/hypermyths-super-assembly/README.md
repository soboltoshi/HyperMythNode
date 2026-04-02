# HyperMyths Super Assembly

A desktop-first **computation exchange** monorepo.

This rewrite makes the market engine the center of the system. The private superbrain, CLI, TUI, and web GUI are all operator surfaces around one job:

- register supply from nodes
- ingest demand from jobs
- quote compute by the minute
- match work to supply in a local exchange loop
- record fills
- generate settlement receipts
- restrict participation with a Solana address whitelist
- keep the whole thing local-first and Solana-ready

## What this repo is now

This is a starter repo for a **local computation exchange**, not a generic agent shell.

### Core ideas

- **Nodes** post capacity, reliability, minute price floors, and a Solana operator address.
- **Jobs** ask for compute with budget, duration, urgency, and a Solana owner address.
- **Whitelist config** gates who can buy and sell compute.
- **Quotes** are created from node supply and job demand.
- **Fills** represent matched quotes.
- **Settlements** record what should be paid or credited.
- **The private superbrain** watches the market and applies routing policy.

## Repo layout

```text
hypermyths-super-assembly/
├── Cargo.toml
├── rust-toolchain.toml
├── crates/
│   ├── superbrain-core/
│   ├── superbrain-cli/
│   └── superbrain-tui/
├── apps/
│   └── webgui/
├── data/
│   ├── market_snapshot.example.json
│   └── solana_whitelist.example.json
├── docs/
│   ├── ARCHITECTURE.md
│   └── BUILD_ORDER.md
└── scripts/
    └── dev-check.sh
```

## Tools and dependencies

Install these on your desktop first:

- **Rust** using `rustup`
- **VS Code**
- VS Code extension: **rust-analyzer**
- **Node.js 20+**
- **pnpm 9+**
- **Git**

Optional later:

- **Docker Desktop**
- **Solana CLI**
- **Anchor CLI**
- **Surfpool** for local Solana workflow

## Where to run the code

Open the repo in **VS Code** on your desktop.
Use the **VS Code terminal**.

## How to use the whitelist

Edit this file first:

```text
data/solana_whitelist.example.json
```

Replace the placeholder addresses with your real Solana addresses.

## How to run the Rust CLI

From the repo root:

```bash
cargo run -p superbrain-cli -- --whitelist data/solana_whitelist.example.json status
```

Other useful commands:

```bash
cargo run -p superbrain-cli -- --whitelist data/solana_whitelist.example.json quotes
cargo run -p superbrain-cli -- --whitelist data/solana_whitelist.example.json fills
cargo run -p superbrain-cli -- --whitelist data/solana_whitelist.example.json settlements
cargo run -p superbrain-cli -- --whitelist data/solana_whitelist.example.json loop --ticks 5
cargo run -p superbrain-cli -- --whitelist data/solana_whitelist.example.json export data/market_snapshot.json --ticks 10
```

## How to run the Rust TUI

From the repo root:

```bash
cargo run -p superbrain-tui
```

It automatically tries to load `data/solana_whitelist.example.json`.
Press `q` to quit.

## How to run the web GUI

From the repo root:

```bash
cd apps/webgui
pnpm install
pnpm dev
```

Open `http://localhost:3000`

## Gotchas to watch out for

1. **You still need to paste your real Solana addresses into the whitelist file.**
   I wired the mechanism, but I cannot guess your actual allowed participants.

2. **Do not put private keys in the whitelist file.**
   Only public Solana addresses belong there.

3. **This is local settlement, not onchain settlement yet.**
   The receipts are local records for now.

4. **The TUI is keyboard-first.**
   Great for fast ops, but not a replacement for the web dashboard.

5. **I could not compile-test this in the current container.**
   The Rust toolchain is not installed here, so run `cargo check` on your desktop first.

## Build direction

The next serious steps are:

1. persist snapshots to disk
2. add a local HTTP API
3. add live order entry and node registration
4. add Surfpool / Solana adapters
5. add quote commitments and real settlement rails
