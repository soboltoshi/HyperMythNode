---
clause: WorldDirectoryBox
version: 1
signature: WorldDirectoryBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# WorldDirectoryBox

**IS:** The sovereign block that owns world listing, visibility, activity state, moderation signals, and directory discovery.

**OWNS:**
- world_entry_registry
- listing_visibility_rules
- activity_scores
- featured_status
- live_status
- moderation_flags
- inactive_archive_state

**MAY:**
- List token worlds
- List sovereign non-token worlds
- Mark worlds active or inactive
- Expose live world visibility
- Publish directory summaries to desktop, web, and bot surfaces
- Filter or hide low-quality or abusive worlds under policy

**MAY NOT:**
- Spawn worlds directly
- Rewrite gameplay or treasury truth
- Expose restricted/private worlds publicly without policy approval

**CONNECTS TO:**
- WorldSpawnBox
- DesktopWorldBox
- GameplayBox
- MediaSurfaceBox
- HyperliquidConvergenceBox
- ArchivistBox
- PublicReadinessBox
