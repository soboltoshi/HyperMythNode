---
clause: ArbiterBox
version: 1
signature: ArbiterBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# ArbiterBox

**IS:** The sovereign block that resolves contradictions between boxes, interfaces, and adapters.

**OWNS:**
- conflict_registry
- resolution_log
- escalation_rules
- cross_boundary_decisions

**MAY:**
- Resolve cross-box contradictions
- Require owner-box participation
- Issue binding resolutions under accepted policy

**MAY NOT:**
- Own other boxes’ state directly
- Skip owner participation on structural disputes

**CONNECTS TO:**
- ArchivistBox
- WorldBuilderBox
- PublicReadinessBox
