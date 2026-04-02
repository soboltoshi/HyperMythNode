---
clause: DesktopWorldBox
version: 1
signature: DesktopWorldBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# DesktopWorldBox

**IS:** The sovereign block that owns the Windows-only desktop embodiment client, including explorable world rendering, VTuber presence integration, live human presence in world, streamer embodiment, and desktop-only control surfaces.

**OWNS:**
- desktop_world_state
- world_room_registry
- live_room_visibility_rules
- human_presence_mode
- agent_presence_mode
- desktop_input_rules
- world_entity_manifest
- streamer_embodiment_rules
- desktop_session_log
- windows_only_policy
- schematic_policy

**MAY:**
- Render the explorable desktop world
- Allow human players to join world rooms
- Allow AI agents to exist as world entities
- Let a human issue commands to an agent that moves in the world
- Let an agent speak to the human or gamer inside the world
- Use OpenLLMVtuberDesktopAdapter for Windows-only embodiment
- Use RopeLiveStreamerAdapter for webcam/live streamer embodiment
- Use LitematicaSchematicAdapter for schematic planning and verification
- Read provider and API-key policy from ModelSovereigntyBox
- Expose approved live-room state to browser/mobile/chatbot observers

**MAY NOT:**
- Run as a mobile/chatbot surface
- Let mobile/chatbot surfaces become VTuber runtime owners
- Rewrite treasury, governance, or identity truth
- Allow direct private-brain access
- Bypass SessionKernelBox lifecycle state
- Treat adapter outputs as sovereign world truth without validation

**CONNECTS TO:**
- SessionKernelBox
- IdentityClusterBox
- TianezhaSuperBrainBox
- AgentMeshBox
- ModelSovereigntyBox
- MediaSurfaceBox
- WorldDirectoryBox
- ArchivistBox
- ArbiterBox
- PublicReadinessBox
