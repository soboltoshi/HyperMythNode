---
clause: TreasuryBox
version: 1
signature: TreasuryBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# TreasuryBox

**IS:** The sovereign block that owns treasury buckets, burn accounting, reward ledgers, drawdown capacity, and reserve allocation rules.

**OWNS:**
- drawdown_treasury
- liquidity_reserve
- operations_reserve
- emergency_reserve
- burn_ledger
- reward_ledger
- fee_intake_log
- treasury_reports

**MAY:**
- Receive retained link tokens
- Receive retained governance flow
- Receive approved fee streams
- Fund protection budgets
- Fund reward settlement
- Track burn and reserve composition

**MAY NOT:**
- Rewrite governance settlement
- Rewrite cluster truth
- Accept adapter-side balances as sovereign truth without validation

**CONNECTS TO:**
- GovernanceFlowBox
- ProtectionBox
- GameplayBox
- ComputationMarketBox
- HyperliquidConvergenceBox
- WorldSpawnBox
- ArchivistBox
