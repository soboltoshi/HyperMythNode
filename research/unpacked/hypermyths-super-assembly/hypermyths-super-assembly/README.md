# HyperMyths Super Assembly

Desktop-first **private superbrain** starter monorepo with:

- **Rust core runtime** (`superbrain-core`)
- **Rust CLI** (`superbrain-cli`)
- **Rust TUI operator console** (`superbrain-tui`)
- **Next.js web GUI shell** (`apps/webgui`)

This repo is designed as a **local-first Solana-only phase 1** foundation.
It is inspired by:

- `instructkr/claw-code` for the idea of a Rust-first harness / local session tool loop
- `solana-foundation/surfpool` for local Solana workflow direction
- `solana-foundation/framework-kit` for wallet/RPC/data orchestration patterns
- `solana-attestation-site` style direction for the web UI feel

## What this repo is

This is **not** a full production Solana node or a full copy of any referenced repo.
It is a clean starter architecture for building:

- a private superbrain service
- a command line interface
- a terminal dashboard
- a lightweight web operator panel
- an event log and task model
- future Solana adapters

## Monorepo layout

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
├── docs/
└── scripts/
```

## Tools and dependencies

Install these on your desktop:

1. **Rust** using `rustup`
2. **Node.js 20+**
3. **pnpm 9+**
4. **Git**
5. **VS Code**
6. VS Code extension: **rust-analyzer**

Optional later:

- **Docker Desktop**
- **Solana CLI**
- **Anchor CLI**

## Where to run the code

Open this repo on your desktop in **VS Code**.
Use the built-in terminal.

### Run the CLI

From the repo root:

```bash
cargo run -p superbrain-cli -- status
```

### Run the TUI

From the repo root:

```bash
cargo run -p superbrain-tui
```

### Run the web GUI

From the repo root:

```bash
cd apps/webgui
pnpm install
pnpm dev
```

Then open:

```text
http://localhost:3000
```

## Build order

### Step 1
Run the CLI and confirm the core compiles.

### Step 2
Run the TUI and verify the operator dashboard appears.

### Step 3
Run the web GUI and confirm the browser shell loads.

### Step 4
Add Solana adapters under `crates/superbrain-core/src/solana/`.

## Gotchas to watch out for

1. **Do not mix core runtime logic into the web app.**
   The web app is only a control surface.

2. **Do not put secret keys in the frontend.**
   Keep signing and key material server-side or local-only.

3. **Do not try to add all Solana features on day 1.**
   First make heartbeat, tasks, event log, CLI, TUI, and web shell stable.

4. **The TUI is keyboard-first.**
   It is lightweight and fast, but not the same as a full browser GUI.

5. **This repo is a starter scaffold.**
   It gives you structure and working surfaces, not a finished market engine.

## Next steps after first successful run

- add local JSON state persistence
- add RPC health checks
- add signer abstraction
- add Solana task queue
- add compute quote engine
- add governance shell logic
