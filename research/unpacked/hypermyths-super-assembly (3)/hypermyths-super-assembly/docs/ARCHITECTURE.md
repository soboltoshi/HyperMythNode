# Architecture

## Service split

### AsiMOG
- private brain: trust policy, reserve policy, sensitive routing
- public brain: public summaries, X-ready narration, visible reasoning surfaces
- backend: exchange loop, fills, settlement prep, local state snapshotting

### ClawMOG
- web frontend
- operator shell
- TUI / human control surfaces
- public market presentation

## Runtime path

1. `superbrain-core` defines the market data model and matching engine.
2. `superbrain-api` owns a live in-memory `LocalExchange` instance.
3. `superbrain-tui` reads its own local exchange loop for lightweight terminal operations.
4. `apps/webgui` calls the API over HTTP and can advance ticks or reset the exchange.

## Local API endpoints

- `GET /health`
- `GET /api/status`
- `GET /api/agents`
- `GET /api/whitelist`
- `POST /api/tick`
- `POST /api/loop?ticks=5`
- `POST /api/reset`
- `POST /api/export/{name}`
