# Build Order

## Phase now implemented

- [x] Rust market core
- [x] local exchange loop
- [x] whitelist gating
- [x] CLI
- [x] TUI
- [x] local HTTP API
- [x] web GUI talking to the live API

## Next build steps

1. persist exchange state to SQLite or JSON snapshots
2. wire TUI to the HTTP API instead of its own local loop
3. add Solana settlement adapter
4. add X posting adapter for AsiMOG public brain
5. add xAI adapter for AsiMOG private/public reasoning
