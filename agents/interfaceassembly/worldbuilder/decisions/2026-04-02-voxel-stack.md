# WorldBuilder Decision: Quest Voxel Stack

Date: 2026-04-02
Decision ID: WB-2026-04-02-VOXEL-STACK

## Decision

Ratify three active boxes:

1. `VoxelGameplayBox`
2. `QuestXrEmbodimentBox`
3. `HermesRuntimeBox`

## Rationale

- Gameplay logic and world mutation need clear ownership separate from XR input handling.
- XR interaction loop and headset UX surfaces are hardware-facing and should remain isolated.
- Hermes role docs required a runnable runtime with durable state and observable status endpoints.

## Accepted interfaces

- `VoxelWorldContract` added to interface registry.

## Implementation note

External engines remain vendored references under `external/`:

- `Blackvoxel`
- `MiniMinecraft`

Merged logic is implemented in Unity-owned scripts under `Assets/Scripts/Voxel`.
