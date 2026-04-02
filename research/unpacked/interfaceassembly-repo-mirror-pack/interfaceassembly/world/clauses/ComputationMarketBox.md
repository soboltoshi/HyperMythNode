---
clause: ComputationMarketBox
version: 1
signature: ComputationMarketBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# ComputationMarketBox

**IS:** The sovereign block that owns compute-task intake, seller offers, buyer demand, mesh compute sharing, settlement, and the canonical 10-minute compute price indexes.

**OWNS:**
- compute_offer_registry
- compute_demand_registry
- compute_task_registry
- compute_unit_normalization_rules
- compute_settlement_rules
- all_compute_price_index_10m
- useful_compute_price_index_10m
- mythiv42_window_registry
- suspicious_trade_filter_rules
- reward_eligibility_log
- compute_reports

**MAY:**
- Intake compute work
- Classify normalized compute units
- Record seller offers and buyer purchases
- Publish the canonical 10-minute all-compute and useful-compute indexes
- Publish MYTHIV42 for the internal 42-agent mesh
- Route compute work to approved mesh agents or nodes
- Share compute for research under approved mission rules
- Inform CancerHawkRouterBox, GameplayBox, TreasuryBox, and MediaSurfaceBox

**MAY NOT:**
- Rewrite treasury balances directly
- Rewrite identity truth
- Rewrite private-brain policy
- Treat unverified or suspicious self-dealing trades as valid index truth

**CONNECTS TO:**
- CancerHawkRouterBox
- AgentMeshBox
- RouterEconomicsBox
- TreasuryBox
- GameplayBox
- WorldSpawnBox
- ArchivistBox
- ArbiterBox
