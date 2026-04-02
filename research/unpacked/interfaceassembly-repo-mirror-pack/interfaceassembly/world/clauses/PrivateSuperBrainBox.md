---
clause: PrivateSuperBrainBox
version: 1
signature: PrivateSuperBrainBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# PrivateSuperBrainBox

**IS:** The backend-only privileged superbrain used by cockpit operators and node owners for sensitive strategic reasoning and restricted orchestration.

**OWNS:**
- private_strategy_state
- cockpit_instruction_log
- node_owner_reasoning_log
- privileged_reports
- hardcoded_wallet_guard
- private_brain_deployment_mode
- restricted_memory_patterns
- private_risk_assessments

**MAY:**
- Run in Google Cloud / Firebase-controlled backend mode
- Optionally run in Conway-hosted backend mode
- Receive requests only from TianezhaSuperBrainBox
- Produce privileged recommendations for TianezhaSuperBrainBox
- Use approved private model/provider policy from ModelSovereigntyBox
- Sign or authorize only those transactions whose destination wallet matches the one hardcoded allowed wallet

**MAY NOT:**
- Receive direct traffic from sub-agents
- Send direct instructions to sub-agents
- Publish directly to public surfaces
- Send transactions to any wallet except the one hardcoded allowed wallet
- Rewrite identity, treasury, governance, or session truth
- Bypass TianezhaSuperBrainBox routing

**CONNECTS TO:**
- TianezhaSuperBrainBox
- ModelSovereigntyBox
- ArchivistBox
- ArbiterBox
