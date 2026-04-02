# Build Order

## Step 1
Run the CLI.

```bash
cargo run -p superbrain-cli -- status
```

## Step 2
Run the TUI.

```bash
cargo run -p superbrain-tui
```

## Step 3
Run the web GUI.

```bash
cd apps/webgui
pnpm install
pnpm dev
```

## Step 4
Add persisted state inside `superbrain-core/src/storage.rs` later.

## Step 5
Add a local HTTP API later so the TUI and web GUI can read live shared state.

## Step 6
Only after that, add Solana adapters.
