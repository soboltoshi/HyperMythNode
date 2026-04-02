---
clause: HermesRuntimeBox
version: 1
signature: HermesRuntimeBox-v1-20260402
created: 2026-04-02
last_amended: 2026-04-02
amendment_ref: none
---

# HermesRuntimeBox

**IS:** The runnable local orchestration runtime for Hermes roles and ASIMOG grievance flow.

**OWNS:**
- runtime_task_queue
- runtime_state_store
- role_manifest_loading
- grievance_review_queue
- runtime_status_endpoints

**MAY:**
- Create and transition task states (`queued/running/review/done/failed`)
- Persist orchestration state to local durable storage
- Expose health/status/task endpoints to shell and tooling

**MAY NOT:**
- Act as sovereign authority over world structure
- Override constitution-level arbitration outcomes
- Mutate gameplay state directly

**CONNECTS TO:**
- QuestXrEmbodimentBox - provides runtime status
- VoxelGameplayBox - receives orchestration tasks
- InterfaceRegistryBox - publishes orchestration interface details
