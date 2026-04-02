# BlockBuilder Report: VoxelGameplayBox

Date: 2026-04-02

## Scope

- Port MiniMinecraft block semantics and terrain generation patterns into Unity Quest runtime.
- Add ASCII voxel structure workflows inspired by Blackvoxel-style map thinking.
- Wire gameplay editing and terminal scripting into controller interactions.

## Box boundaries

- `VoxelGameplayBox` owns voxel state, rules, generation, ASCII mapping, and Lua-like commands.
- `QuestXrEmbodimentBox` owns XR rig/input and in-headset UX surfaces.
- `HermesRuntimeBox` owns local ASIMOG/Hermes orchestration runtime state and APIs.

## Interfaces touched

- Added `VoxelWorldContract`.
- Updated block and interface registries.

## Validation artifacts

- Unity edit tests:
  - `VoxelBlockRulesTests.cs`
  - `VoxelAsciiPaletteTests.cs`
- Hermes runtime tests:
  - `agents/hermes/runtime/test/runtime.test.mjs`
