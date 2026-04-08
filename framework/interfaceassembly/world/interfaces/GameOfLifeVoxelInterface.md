# GameOfLifeVoxelInterface

## Purpose

Defines request and result payloads for Unity-side 3D cellular automata voxel generation.

## Owned By

InterfaceRegistryBox

## Consumed By

- VoxelGameplayBox
- QuestXrEmbodimentBox

## Input Fields

- `width` (int, expected `42` in life-cube mode)
- `height` (int, expected `42` in life-cube mode)
- `depth` (int, expected `42` in life-cube mode)
- `steps` (int)
- `seed_density` (float)
- `random_seed` (int)

## Output Fields

- `alive_cells` (int)
- `voxelized_cells` (int)
- `rule` (string)
- `world_size` (`[x, y, z]`)

## Invariants

- runs as an embodiment/gameplay adapter only
- never mutates TruthKernel directly
- no money or agent-registry authority
