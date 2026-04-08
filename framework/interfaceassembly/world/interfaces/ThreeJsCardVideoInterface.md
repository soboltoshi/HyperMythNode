# ThreeJsCardVideoInterface

## Purpose

Defines scene descriptor payloads derived from three.js for in-game cards and video adapter seeding.

## Owned By

InterfaceRegistryBox

## Consumed By

- QuestXrEmbodimentBox
- VoxelGameplayBox
- PrivateBrainRouterBox (optional downstream video assembly path)

## Input Fields

- `token_address` (string)
- `style_preset` (string)
- `request_summary` (string, optional)
- `world_size` (`[x, y, z]`)

## Output Fields

- `random_seed` (int)
- `scene_profile` (string)
- `card_layers` (`string[]`)
- `video_layers` (`string[]`)

## Invariants

- descriptor-only interface
- no truth mutation ownership
- no payment routing
- no wallet material
