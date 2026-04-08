# Contactway Native Adoption Notes

Date: 2026-04-03

## Upstream Reviewed

- `intiface/intiface-engine` (Rust engine, websocket/device backend wrapper)
- `intiface/intiface-central` (Flutter desktop/mobile GUI over Rust bridge)
- `intiface/intiface-game-haptics-router` (Windows game haptics injection router)
- `buttplugio/buttplug` (Rust protocol/server/client core)

## What We Adopted

- Contract-first adapter in Interface Assembly:
  - `ContactwayAdapter`
  - `ContactwayBridgeInterface`
- Native Rust kernel control plane:
  - `GET /api/contactway/status`
  - `POST /api/contactway/connect`
  - `POST /api/contactway/disconnect`
  - `POST /api/contactway/intent`
  - `contactway.intent` command route
- Desktop companion proxy routes:
  - `GET /contactway/status`
  - `POST /contactway/connect`
  - `POST /contactway/disconnect`
  - `POST /contactway/intent`
- Desktop GUI in web operator for mode/url connect/disconnect and test pulse.
- Quest VR shell command support (`contactway`) and voice-triggered adapter path.

## What We Did Not Blindly Adopt

- We did not import game-process injection flow from `intiface-game-haptics-router` as the default runtime path.
- We did not give upstream transports ownership over world truth, registries, or payment routes.
- We did not bypass kernel validation by letting web/VR talk directly to device transports.

## Native Boundary Model

- Source surfaces (`quest3`, `web-operator`, `desktop-shell`) emit contact intents.
- Kernel validates schema/ranges and records status/intent history.
- Transport mode + URL are explicit (`buttplug_ws`, `intiface_engine`, `intiface_central`, `custom`).
- Companion and web GUI are only control surfaces; kernel remains authority for acceptance/rejection.

## Why This Fits HyperFlow Interface Assembly

- Adapter is explicit and registry-backed.
- Shared interface is explicit and typed.
- Cross-surface behavior is visible and traceable.
- Authority boundaries remain with owner boxes, not external repos.