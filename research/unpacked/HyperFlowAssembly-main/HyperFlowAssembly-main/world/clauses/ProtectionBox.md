---
clause: ProtectionBox
version: 1
signature: ProtectionBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# ProtectionBox

**IS:** The sovereign block that owns protected epochs, claim eligibility, vesting, compensation execution, and consumed-lot logic.

**OWNS:**
- protected_epoch_registry
- protected_purchase_log
- claim_window_state
- claim_eligibility_log
- vesting_rules
- compensation_execution_log
- consumed_lot_registry

**MAY:**
- Record protected purchases
- Open claim epochs
- Compute claim eligibility
- Execute approved compensation
- Mark lots as consumed
- Read treasury limits from TreasuryBox

**MAY NOT:**
- Rewrite treasury balances directly
- Rewrite cluster truth
- Reopen consumed lots

**CONNECTS TO:**
- TreasuryBox
- IdentityClusterBox
- SessionKernelBox
- ArchivistBox
- ArbiterBox
