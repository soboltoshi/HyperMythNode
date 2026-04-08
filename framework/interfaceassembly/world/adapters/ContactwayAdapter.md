# ContactwayAdapter

## Upstream

- `https://github.com/intiface/intiface-engine`
- `https://github.com/intiface/intiface-central`
- `https://github.com/intiface/intiface-game-haptics-router`
- `https://github.com/buttplugio/buttplug`

## Local Bridge

- `crates/lx-core/src/main.rs` (`/api/contactway/*` + `contactway.intent` command path)
- `desktop/claw-companion/src/index.mjs` (`/contactway/*` proxy)
- `apps/web/app/operator/page.tsx` (desktop GUI control surface)
- `apps/unity-client/Assets/Scripts/Voxel/VoxelLuaBridge.cs` (`contactway` command in VR shell)

## Owner Box

HermesRuntimeBox

## Exposed Interface

- `ContactwayBridgeInterface`
- kernel command kind: `contactway.intent`
- kernel routes: `/api/contactway/status`, `/api/contactway/connect`, `/api/contactway/disconnect`, `/api/contactway/intent`

## Install Status

Active (native wrapper)

## Native Decisions

- Keep Buttplug/Intiface as external transport adapters, not sovereign world authority.
- Do not import game-process injection defaults from `intiface-game-haptics-router` as the primary path.
- Route desktop/web/VR through one kernel contract before adapter transport dispatch.

## Must Never Own

- truth kernel authority
- agent registry authority
- money routing or settlement
- direct process injection authority in game clients