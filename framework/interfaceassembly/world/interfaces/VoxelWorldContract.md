# VoxelWorldContract

## Purpose

Defines stable interfaces between XR embodiment, voxel gameplay logic, and script/runtime orchestration.

## Owned By

InterfaceRegistryBox

## Consumed By

- QuestXrEmbodimentBox
- VoxelGameplayBox
- HermesRuntimeBox

## Required Fields

- world_bounds (`x`, `z`, `y`)
- block_type (enum value + glyph)
- placement_intent (`set` or `remove`)
- tool_origin (`right_hand`, `head_fallback`, `script`)
- command_receipt (accepted/rejected + receipt id)

## Invariants

- block type parsing supports enum names and ASCII glyph aliases
- all edits stay within bounded world dimensions
- every scripted edit is idempotent for identical command and target
- XR interaction sends edge-triggered intents only (no repeat flood on held buttons)
