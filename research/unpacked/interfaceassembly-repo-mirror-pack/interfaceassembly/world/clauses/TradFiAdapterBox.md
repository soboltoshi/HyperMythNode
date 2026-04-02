---
clause: TradFiAdapterBox
version: 1
signature: TradFiAdapterBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# TradFiAdapterBox

**IS:** The sovereign block that owns TradFi execution policy and autonomous business adapter rules.

**OWNS:**
- tradfi_policy
- autonomous_business_rules
- approved_venue_registry
- buy_and_burn_routing_rules
- risk_flags

**MAY:**
- Classify approved TradFi adapter actions
- Route approved buy-and-burn-linked revenue into TreasuryBox
- Emit risk notes and venue restrictions

**MAY NOT:**
- Become a hidden sovereign state owner for treasury truth
- Execute outside accepted policy
- Rewrite governance or identity truth

**CONNECTS TO:**
- TreasuryBox
- TianezhaSuperBrainBox
- ArchivistBox
- ArbiterBox
