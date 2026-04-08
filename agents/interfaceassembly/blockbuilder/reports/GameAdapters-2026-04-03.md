# BlockBuilder Report: Game Adapters (GameOfLife + Three.js)

Date: 2026-04-03

## Scope

- Add Game-of-Life adapter wiring for request-driven voxel randomization in Unity.
- Add three.js descriptor adapter wiring for in-game cards and video-seed payloads.
- Expose creator-shell commands (`life42`, `threecard`) that route through adapter boundaries.

## Dependencies

- `VoxelGameplayBox` (`VoxelWorldRuntime`, `VoxelLuaBridge`)
- `QuestXrEmbodimentBox` (`QuestXrRuntime`, `QuestVoiceBridge`)
- Interface registry entries for `GameOfLifeVoxelInterface` and `ThreeJsCardVideoInterface`

## Output Surface

- Local 3D automata-generated voxel world updates.
- Deterministic descriptor payloads for three.js-style card/video layers.
- Voice-triggered additive intents for local generation requests.

## Adapters Do Not Own

- canonical world truth
- router money state
- agent registry authority
- kernel command acceptance
