---
adapter: ConwayAgentAdapter
version: 1
owner: AgentMeshBox
status: active
signature: ConwayAgentAdapter-v1-20260331
external_system: Conway
risk_class: medium
---

# ConwayAgentAdapter

## Purpose

Provides Conway-backed execution for sub-agents, compute sellers/buyers, cloud sandboxes, machine-paid actions, and node-like agent workloads.

## Boundaries

- execution edge only
- does not own protocol truth
- Conway sub-agents may not contact PrivateSuperBrainBox directly
- all privileged routing must pass through TianezhaSuperBrainBox
