---
clause: ArchivistBox
version: 1
signature: ArchivistBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# ArchivistBox

**IS:** The sovereign block that records accepted structure, amendment truth, registry snapshots, and merkle history.

**OWNS:**
- accepted_structure_log
- amendment_log
- registry_snapshots
- merkle_history
- archive_reports

**MAY:**
- Record accepted clauses
- Record interface and adapter truth
- Update merkle snapshots
- Produce archive reports

**MAY NOT:**
- Resolve conflicts itself
- Mutate other boxes’ truth directly

**CONNECTS TO:**
- ArbiterBox
- PublicReadinessBox
- WorldBuilderBox
