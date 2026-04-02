---
clause: SessionKernelBox
version: 1
signature: SessionKernelBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# SessionKernelBox

**IS:** The sovereign kernel that owns canonical lifecycle state, runtime session states, timers, rails, and allowed state transitions.

**OWNS:**
- lifecycle_state
- state_transition_rules
- timer_rules
- rail_activation_state
- protocol_mode
- active_epoch_registry
- emergency_gate_status
- canonical_runtime_truth
- state_audit_log

**MAY:**
- Open and close lifecycle session states
- Gate transitions between bootstrap, identity, governance, gameplay, claim, Hyperliquid preparation, launch, redemption, and continuous operation
- Read reports from other sovereign boxes
- Escalate contradictions to ArbiterBox
- Expose canonical session state through shared interfaces
- Trigger emergency pause transitions

**MAY NOT:**
- Count votes directly
- Rewrite cluster identity truth
- Rewrite treasury balances
- Rewrite reward settlement
- Accept adapter outputs as canonical truth without validation by the owning box

**CONNECTS TO:**
- IdentityClusterBox
- GovernanceFlowBox
- TreasuryBox
- ProtectionBox
- TianezhaSuperBrainBox
- GameplayBox
- DesktopWorldBox
- MediaSurfaceBox
- HyperliquidConvergenceBox
- ArchivistBox
- ArbiterBox
