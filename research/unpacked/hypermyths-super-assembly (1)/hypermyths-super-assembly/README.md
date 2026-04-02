# HyperMyths Super Assembly

A desktop-first **computation markets** monorepo.

This rewrite makes the market engine the center of the system. The private superbrain, CLI, TUI, and web GUI are all operator surfaces around one job:

- register supply from nodes
- ingest demand from jobs
- quote compute by the minute
- match work to supply
- record fills
- generate settlement receipts
- keep the whole thing local-first and Solana-ready

## What this repo is now

This is a starter repo for a **local computation market**, not a generic agent shell.

### Core ideas

- **Nodes** post capacity, reliability, and minute price floors.
- **Jobs** ask for compute with budget, duration, and urgency.
- **Quotes** are created from node supply and job demand.
- **Fills** represent accepted quotes.
- **Settlements** record what should be paid or credited.
- **The private superbrain** watches the market and suggests routing policy.

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
│   └── market_snapshot.example.json
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

## How to run the Rust CLI

From the repo root:

```bash
cargo run -p superbrain-cli -- status
```

Other useful commands:

```bash
cargo run -p superbrain-cli -- nodes
cargo run -p superbrain-cli -- jobs
cargo run -p superbrain-cli -- quotes
cargo run -p superbrain-cli -- settlements
cargo run -p superbrain-cli -- export data/market_snapshot.json
```

## How to run the Rust TUI

From the repo root:

```bash
cargo run -p superbrain-tui
```

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

1. **Do not put signing or key material in the web app.**
   The web GUI is a local operator surface only.

2. **Do not make Solana settlement your day-1 dependency.**
   First prove the local market, then add chain settlement as an adapter.

3. **Do not let the private superbrain become magic.**
   It should suggest prices and routing policy, but the market state must stay inspectable.

4. **The TUI is keyboard-first.**
   Great for fast ops, but not a replacement for the web dashboard.

5. **This scaffold is intentionally lightweight.**
   It gives you structure, starter logic, and interfaces. It is not a production exchange engine yet.

## Build direction

The next serious steps are:

1. persist snapshots to disk
2. add a local HTTP API
3. add live ticks and market mutations
4. add Surfpool / Solana adapters
5. add quote acceptance and real settlement rails
