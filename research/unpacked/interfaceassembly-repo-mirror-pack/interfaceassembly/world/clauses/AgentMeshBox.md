---
clause: AgentMeshBox
version: 1
signature: AgentMeshBox-v1-20260331
created: 2026-03-31
last_amended: 2026-03-31
amendment_ref: none
---

# AgentMeshBox

**IS:** The sovereign block that owns autonomous sub-agent routing, scoped task execution, bot channel participation, world-agent assignment, and Conway-backed agent execution.

**OWNS:**
- subagent_registry
- task_registry
- mesh_execution_log
- isolation_policy
- channel_bot_map
- world_agent_map
- allowed_tool_scope
- escalation_rules

**MAY:**
- Spawn and route sub-agents through ConwayAgentAdapter
- Use HermesAgentAdapter only where explicitly approved as a substrate bridge
- Coordinate Telegram and WeChat bot surfaces
- Coordinate world agents, market agents, research agents, and media agents
- Return outputs to TianezhaSuperBrainBox
- Request media work through MediaSurfaceBox
- Request compute work through ComputationMarketBox

**MAY NOT:**
- Communicate directly with PrivateSuperBrainBox
- Allow any sub-agent to communicate directly with PrivateSuperBrainBox
- Bypass TianezhaSuperBrainBox for privileged routing
- Rewrite sovereign truth from other blocks

**CONNECTS TO:**
- TianezhaSuperBrainBox
- DesktopWorldBox
- MediaSurfaceBox
- ComputationMarketBox
- AgentRuntimePolicyBox
- ArchivistBox
- ArbiterBox
