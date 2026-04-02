---
clause: TianezhaSuperBrainBox
version: 1
signature: TianezhaSuperBrainBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# TianezhaSuperBrainBox

**IS:** The public superbrain router that coordinates public intelligence, routes work to sub-agents, mediates all contact with the private superbrain, and acts as the only bridge between privileged strategy and downstream execution.

**OWNS:**
- public_strategy_state
- routing_policy
- delegation_log
- subagent_dispatch_log
- private_request_log
- private_response_log
- mesh_whitelist
- allowed_adapter_whitelist
- strategic_explanation_log
- public_wallet_action_policy

**MAY:**
- Receive Base-side delegated flow
- Route work to AgentMeshBox
- Route privileged requests to PrivateSuperBrainBox
- Receive private outputs and transform them into approved downstream instructions
- Use approved payment and trading routes
- Enforce mesh and adapter whitelists
- Inform GameplayBox, DesktopWorldBox, MediaSurfaceBox, CancerHawkRouterBox, HyperliquidConvergenceBox, and WorldSpawnBox
- Use ModelSovereigntyBox policy
- Use G0DM0D3 and Hermes through approved channels

**MAY NOT:**
- Allow direct traffic between sub-agents and PrivateSuperBrainBox
- Allow PrivateSuperBrainBox to directly command sub-agents
- Use unapproved counterparties or adapters outside whitelist policy
- Rewrite treasury, identity, or governance truth directly
- Bypass SessionKernelBox lifecycle gates

**CONNECTS TO:**
- SessionKernelBox
- AgentMeshBox
- PrivateSuperBrainBox
- GameplayBox
- DesktopWorldBox
- MediaSurfaceBox
- CancerHawkRouterBox
- HyperliquidConvergenceBox
- RouterEconomicsBox
- ModelSovereigntyBox
- WorldSpawnBox
- ArchivistBox
- ArbiterBox
