---
clause: HyperliquidConvergenceBox
version: 1
signature: HyperliquidConvergenceBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# HyperliquidConvergenceBox

**IS:** The sovereign block that owns Hyperliquid bootstrap, native market staging, peeps market staging, perp market staging, and burn-redemption convergence.

**OWNS:**
- hyperliquid_launch_state
- peeps_market_state
- perp_market_state
- redemption_window_state
- burn_intake_log
- redemption_settlement_log
- convergence_reports

**MAY:**
- Stage native markets
- Stage peeps market
- Stage perp market for CPI69, MYTHIV42, and later approved markets
- Validate burn-redemption requests
- Read gameplay readiness and Tianezha strategy
- Request adapter execution for approved outcomes

**MAY NOT:**
- Rewrite identity truth
- Rewrite governance settlement
- Rewrite treasury balances directly
- Accept adapter output as sovereign truth without validation

**CONNECTS TO:**
- SessionKernelBox
- IdentityClusterBox
- TreasuryBox
- GameplayBox
- TianezhaSuperBrainBox
- WorldDirectoryBox
- ArchivistBox
- ArbiterBox
