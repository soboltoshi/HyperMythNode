---
clause: GovernanceFlowBox
version: 1
signature: GovernanceFlowBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# GovernanceFlowBox

**IS:** The sovereign block that owns proposal windows, flow-voting validation, directional counting, and proposal settlement.

**OWNS:**
- proposal_registry
- active_voting_windows
- counted_yes_flow
- counted_no_flow
- delegated_base_flow
- settlement_log
- invalid_vote_log

**MAY:**
- Count YES flow from Solana-linked wallets
- Count NO flow from BNB-linked wallets
- Route Base-linked flow into Tianezha delegation
- Settle proposals
- Route retained governance flow to TreasuryBox

**MAY NOT:**
- Rewrite cluster truth
- Rewrite treasury balances directly
- Accept holding-based voting as valid governance

**CONNECTS TO:**
- IdentityClusterBox
- TianezhaSuperBrainBox
- TreasuryBox
- SessionKernelBox
- ArchivistBox
- ArbiterBox
