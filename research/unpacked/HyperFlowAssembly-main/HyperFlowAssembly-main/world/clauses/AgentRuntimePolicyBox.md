---
clause: AgentRuntimePolicyBox
version: 1
signature: AgentRuntimePolicyBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# AgentRuntimePolicyBox

**IS:** The sovereign block that owns runtime class rules, Conway-only restrictions, approved fallback order, and cheapest-runtime policy for non-core agents.

**OWNS:**
- agent_class_registry
- runtime_policy_matrix
- conway_only_rules
- fallback_order_registry
- approved_runtime_list
- cost_selection_rules
- risk_class_rules

**MAY:**
- Classify agents as MYTHIV42 internal mesh or public/world/community class
- Require Conway-only execution for the private 42-agent mesh
- Allow cheapest approved runtime selection for general agents
- Approve ElizaOS, Poly capability, x402-linked and other runtime options under policy

**MAY NOT:**
- Allow MYTHIV42 agents to leave Conway
- Bypass Tianezha routing for privileged execution
- Rewrite sovereign truth owned by other boxes

**CONNECTS TO:**
- AgentMeshBox
- TianezhaSuperBrainBox
- ArchivistBox
- ArbiterBox
