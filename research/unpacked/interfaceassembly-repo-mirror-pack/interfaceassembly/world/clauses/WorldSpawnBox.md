---
clause: WorldSpawnBox
version: 1
signature: WorldSpawnBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# WorldSpawnBox

**IS:** The sovereign block that owns world activation requests, spawn type, payment confirmation, Conway provisioning triggers, world creation, and service activation status.

**OWNS:**
- spawn_request_registry
- spawn_type_rules
- activation_payment_log
- token_verification_log
- provisioning_request_log
- world_creation_log
- service_manifest_registry
- spawn_status

**MAY:**
- Activate token worlds after token verification
- Activate sovereign non-token worlds
- Confirm the $10 USDC world activation fee
- Trigger Conway provisioning through ConwayProvisioningAdapter
- Create world records and initialize service defaults
- Initialize public brain bootstrap requests
- Request directory listing through WorldDirectoryBox

**MAY NOT:**
- Launch tokens
- Act as a token launchpad
- Rewrite treasury truth
- Rewrite gameplay truth
- Bypass payment confirmation

**CONNECTS TO:**
- TianezhaSuperBrainBox
- TreasuryBox
- ComputationMarketBox
- WorldDirectoryBox
- ArchivistBox
- ArbiterBox
