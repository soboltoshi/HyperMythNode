---
clause: RouterEconomicsBox
version: 1
signature: RouterEconomicsBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# RouterEconomicsBox

**IS:** The sovereign block that owns x402 payable action policy, crypto payment action policy, approved commercial verbs, and machine-routed payment logic.

**OWNS:**
- payable_action_registry
- approved_payment_verbs
- x402_rules
- crypto_payment_rules
- action_pricing_rules
- payment_audit_log

**MAY:**
- Define priced machine actions
- Define approved x402 and crypto payment verbs
- Let TianezhaSuperBrainBox use approved payment routes
- Route fee outputs to TreasuryBox
- Coordinate with AgentMeshBox and MediaSurfaceBox

**MAY NOT:**
- Allow unregistered payment verbs
- Rewrite treasury truth directly
- Bypass whitelist rules
- Ignore private-brain hard wallet constraints

**CONNECTS TO:**
- TianezhaSuperBrainBox
- ComputationMarketBox
- TreasuryBox
- AgentMeshBox
- MediaSurfaceBox
- ArchivistBox
