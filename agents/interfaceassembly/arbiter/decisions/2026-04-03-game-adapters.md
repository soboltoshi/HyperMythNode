# Arbiter Decision: Game Adapter Classification (GameOfLife + Three.js)

Date: 2026-04-03  
Decision ID: ARB-2026-04-03-GAME-ADAPTERS

## Decision

`GameOfLifeAdapter` and `ThreeJsVideoAdapter` are classified as adapters, not sovereign boxes.

## Ruling

- `GameOfLifeAdapter` is a Unity gameplay adapter under `VoxelGameplayBox`.
- `ThreeJsVideoAdapter` is a Unity embodiment adapter under `QuestXrEmbodimentBox`.
- Both adapters may shape local generation and descriptor payloads only.
- Truth writes still require kernel command paths and receipts.

## Boundary Protection

- No adapter gains authority over kernel truth, agent registry, or router boundaries.
- No adapter touches money routing, wallets, or settlement paths.
- Any 42x42x42 life-cube generation is embodiment-side simulation and does not change sovereign authority by itself.
