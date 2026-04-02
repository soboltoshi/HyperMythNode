---
clause: IdentityClusterBox
version: 1
signature: IdentityClusterBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# IdentityClusterBox

**IS:** The sovereign block that owns 3-wallet identity linking, cluster truth, recovery, and directional rail roles.

**OWNS:**
- cluster_registry
- wallet_membership_truth
- slot_role_truth
- active_cluster_state
- suspended_cluster_state
- recovery_requests
- cluster_audit_log

**MAY:**
- Validate 3-token linking
- Record one identity cluster per wallet
- Assign Solana YES, BNB NO, and Base Tianezha delegation roles
- Expose cluster truth to other blocks
- Process recovery and rotation rules through accepted policy

**MAY NOT:**
- Rewrite treasury or governance settlement
- Accept duplicate wallet ownership
- Bypass ArbiterBox for contested recovery cases

**CONNECTS TO:**
- GovernanceFlowBox
- ProtectionBox
- GameplayBox
- DesktopWorldBox
- HyperliquidConvergenceBox
- ArchivistBox
- ArbiterBox
