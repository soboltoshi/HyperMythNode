---
clause: QuestXrEmbodimentBox
version: 1
signature: QuestXrEmbodimentBox-v1-20260402
created: 2026-04-02
last_amended: 2026-04-02
amendment_ref: none
---

# QuestXrEmbodimentBox

**IS:** The box that owns Quest XR rig/runtime wiring, hand/controller interaction loops, and in-headset UX surfaces.

**OWNS:**
- xr_origin_bootstrap
- quest_controller_input_edges
- wrist_menu_surface
- floating_terminal_surface
- hologram_preview_surface
- locomotion_mode_state

**MAY:**
- Translate controller actions into gameplay intents
- Toggle fly/swim/jump mode states using bounded locomotion rules
- Forward stage readiness signals to kernel command bridge

**MAY NOT:**
- Redefine voxel generation semantics
- Change Hermes orchestration policy
- Bypass interface contracts for cross-box changes

**CONNECTS TO:**
- VoxelGameplayBox - sends edit and command intents
- HermesRuntimeBox - receives orchestration status for shell display
- InterfaceRegistryBox - consumes the VoxelWorldContract
