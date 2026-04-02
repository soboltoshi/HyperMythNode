| Box | Runtime Owner | Canonical Paths | Key Interfaces | Status |
|---|---|---|---|---|
| SessionKernelBox | Tianezha node runtime | `nodes/tianezha/`, `packages/shared-jobs/`, `shared/mesh-contracts/` | WorldSpawnInterface, WorldDirectoryInterface | active |
| IdentityClusterBox | Tianezha identity state | `nodes/tianezha/`, `packages/shared-types/src/node.mjs` | ClusterIdentityInterface | active |
| GovernanceFlowBox | Tianezha governance runtime | `nodes/tianezha/`, `apps/tianezha-admin/` | GovernanceFlowInterface | active |
| TreasuryBox | Tianezha treasury plus router receipts | `nodes/tianezha/`, `packages/shared-router/` | TreasuryReserveInterface | active |
| ProtectionBox | Session lifecycle guardrails | `nodes/tianezha/`, `packages/shared-jobs/` | ProtectedEpochInterface | active |
| TianezhaSuperBrainBox | Public router and delegation layer | `nodes/tianezha/`, `packages/shared-agents/` | SuperBrainRoutingInterface, TianezhaDelegationInterface | active |
| PrivateSuperBrainBox | Backend-only privileged routing | `nodes/tianezha/`, `packages/shared-agents/` | PrivateBrainDeploymentInterface, PrivateInstructionInterface | active |
| GameplayBox | Branded surface gameplay lanes | `apps/hashart-web/`, `apps/larpa-web/`, `nodes/larpa/`, `nodes/hashart/` | GameplaySeasonInterface | active |
| DesktopWorldBox | Windows-only embodiment sidecar | `nodes/tianezha/`, `packages/adapters/tianezha/` | LiveWorldPresenceInterface | planned |
| MediaSurfaceBox | Media ingest and public/private publishing surfaces | `apps/hashart-web/`, `apps/larpa-web/`, `packages/shared-media-core/` | MediaManifestInterface, VideoGenerationInterface | active |
| AgentMeshBox | Sub-agent routing and scoped execution | `packages/shared-agents/`, `packages/shared-workers/`, `nodes/tianezha/` | SubAgentTaskInterface | active |
| CancerHawkRouterBox | Useful-work routing and research flow | `packages/shared-router/`, `packages/shared-agents/`, `nodes/tianezha/` | UsefulWorkProofInterface | active |
| ComputationMarketBox | Compute intake, quotes, assignment, and receipts | `packages/shared-router/`, `nodes/tianezha/`, `nodes/mythiv/` | ComputePriceIndexInterface | active |
| RouterEconomicsBox | Settlement lane policy and paid action routing | `packages/shared-router/`, `nodes/mythiv/`, `packages/adapters/tianezha/` | TianezhaDelegationInterface | active |
| HyperliquidConvergenceBox | Derivative staging and convergence rail | `nodes/tianezha/`, `nodes/mythiv/`, `packages/adapters/tianezha/` | HyperliquidRedemptionInterface | active |
| ModelSovereigntyBox | Provider, key, and runtime approval policy | `packages/shared-agents/`, `apps/tianezha-admin/` | UserModelSovereigntyInterface | active |
| WorldSpawnBox | World activation requests and provisioning gates | `nodes/tianezha/`, `apps/tianezha-admin/` | WorldSpawnInterface | active |
| WorldDirectoryBox | World listing and discovery status | `apps/hashart-web/`, `apps/larpa-web/`, `nodes/tianezha/` | WorldDirectoryInterface | active |
| AgentRuntimePolicyBox | Runtime class rules and approval order | `packages/shared-agents/`, `apps/tianezha-admin/` | SubAgentTaskInterface | active |
| TradFiAdapterBox | Edge-only TradFi integration | `packages/adapters/tianezha/` | none | active |
| RoboticsBox | Edge-only physical output policy | `packages/adapters/tianezha/` | none | planned |
| ArchivistBox | Accepted structure and snapshot recording | `world/registries/`, `world/merkle/` | none | active |
| ArbiterBox | Conflict resolution and emergency contradiction handling | `world/proposals/`, `apps/tianezha-admin/` | none | active |
| PublicReadinessBox | Publish gate and legibility review | `world/registries/`, `apps/tianezha-admin/` | none | active |
| WorldBuilderBox | Boundary classification and shape control | `world/WORLD.md`, `world/proposals/`, `world/registries/` | none | active |
