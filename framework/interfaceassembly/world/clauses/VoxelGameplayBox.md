---
clause: VoxelGameplayBox
version: 1
signature: VoxelGameplayBox-v1-20260402
created: 2026-04-02
last_amended: 2026-04-02
amendment_ref: none
---

# VoxelGameplayBox

**IS:** The box that owns voxel world generation, block semantics, ASCII structure import/export, and creator editing rules.

**OWNS:**
- voxel_block_types
- voxel_generation_rules
- ascii_voxel_palette
- lua_voxel_command_bridge
- world_edit_operations

**MAY:**
- Read bounded world targets from kernel snapshot contracts
- Generate and mutate voxel state inside the bounded world envelope
- Expose commands for scripting and terminal control
- Emit deterministic slices for debugging and review

**MAY NOT:**
- Own XR hardware routing directly
- Own release gate decisions
- Mutate kernel truth outside published command channels

**CONNECTS TO:**
- QuestXrEmbodimentBox - receives controller-driven edit intents
- HermesRuntimeBox - receives orchestration tasks and status signals
- InterfaceRegistryBox - publishes world contracts and schema changes
