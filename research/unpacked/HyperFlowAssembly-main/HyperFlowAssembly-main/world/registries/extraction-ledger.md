| Legacy Source In `C:\SessionMint\Tianezha` | New Owner Box | Destination In This Repo | Status | Notes |
|---|---|---|---|---|
| `app/bitclaw/` and `app/api/identity/` | IdentityClusterBox | `nodes/tianezha/`, `packages/shared-types/` | mapped | Identity truth stays sovereign to Tianezha. |
| `app/bolclaw/` and `app/api/bolclaw/` | WorldDirectoryBox, MediaSurfaceBox | `apps/hashart-web/` | mapped | Public feed moves to the public-first surface. |
| `app/gendelve/` and `app/api/gendelve/` | GovernanceFlowBox | `apps/tianezha-admin/` | mapped | Governance is operational, not public merch. |
| `app/heartbeat/` and `app/api/heartbeat/` | SessionKernelBox, AgentMeshBox | `apps/tianezha-admin/`, `nodes/tianezha/` | mapped | Telemetry stays near operators and the node runtime. |
| `app/tianshi/` and `app/api/tianshi/` | TianezhaSuperBrainBox | `nodes/tianezha/`, `packages/shared-agents/` | mapped | Public router remains the only bridge to private logic. |
| `app/tianzi/` | ComputationMarketBox | `apps/mythiv-web/`, `packages/shared-router/` | mapped | Market and quote visibility move to broker-aware surfaces. |
| `app/nezha/` and `app/api/nezha/` | HyperliquidConvergenceBox | `apps/mythiv-web/`, `packages/adapters/tianezha/` | mapped | Perp and convergence logic stays out of branded customer surfaces. |
| `app/gistbook/` and `app/api/gistbook/` | MediaSurfaceBox | `packages/adapters/tianezha/`, `shared/knowledge-base/` | mapped | Gistbook remains edge-facing and not a truth owner. |
| `app/launchonomics/` and `app/api/launchonomics/` | WorldSpawnBox | `apps/tianezha-admin/`, `nodes/tianezha/` | mapped | Launch framing becomes world activation framing. |
| `app/livestream/` and `app/api/livestream/` | MediaSurfaceBox | `apps/hashart-web/`, `apps/larpa-web/`, `packages/shared-media-core/` | mapped | Livestream is a media publication surface. |
| `app/page.tsx` shell | MediaSurfaceBox | `apps/hashart-web/`, `apps/larpa-web/`, `apps/tianezha-admin/` | mapped | One shell becomes three sovereign surfaces. |
| `app/api/bots/` and `app/api/bot-bindings/` | AgentMeshBox | `nodes/tianezha/`, `packages/shared-agents/` | mapped | Bot channel routing stays inside the mesh boundary. |
| `packages/core/src/computeMarket.ts` | ComputationMarketBox | `packages/shared-router/` | mapped | Quote and assignment contracts are normalized. |
| `packages/core/src/computePriceMarkets.ts` | ComputationMarketBox, HyperliquidConvergenceBox | `packages/shared-router/`, `nodes/tianezha/` | mapped | Spot and derivative references split by owner. |
| `packages/core/src/rewards.ts` | TreasuryBox | `packages/shared-router/`, `nodes/tianezha/` | mapped | Reward ledger becomes receipt-linked treasury truth. |
| `packages/core/src/savegame.ts` | SessionKernelBox | `shared/mesh-contracts/`, `nodes/tianezha/` | mapped | Portable state remains neutral and mesh-safe. |
| `packages/core/src/subagents.ts` | AgentMeshBox | `packages/shared-agents/`, `packages/shared-workers/` | mapped | Agent contracts and worker contracts are now separate. |
| `packages/core/src/vendorMarket.ts` | RouterEconomicsBox | `packages/shared-router/`, `nodes/mythiv/` | mapped | Commercial routing belongs to the broker and router policy. |
| `packages/adapters/src/payments/` | RouterEconomicsBox | `packages/adapters/tianezha/` | mapped | Payment rails stay edge-only. |
| `packages/adapters/src/gistbook.ts` | MediaSurfaceBox | `packages/adapters/tianezha/` | mapped | Publication adapter only. |
| `packages/adapters/src/cancerhawk.ts` | CancerHawkRouterBox | `packages/adapters/tianezha/`, `packages/shared-router/` | mapped | Useful-work routing stays boxed. |
| `services/tianshi-automaton/` | AgentMeshBox, TianezhaSuperBrainBox | `packages/shared-agents/`, `nodes/tianezha/` | mapped | Runtime loop logic becomes shared contracts plus node-local operation. |
| `workers/child-brain-gateway.ts` | PrivateSuperBrainBox | `nodes/tianezha/` | mapped | Private routing remains node-local. |
| `workers/treasury-router.ts` | TreasuryBox, RouterEconomicsBox | `nodes/mythiv/`, `packages/shared-router/` | mapped | Settlement and receipts move closer to MYTHIV. |
| `workers/arbiter.ts` | ArbiterBox | `apps/tianezha-admin/`, `world/proposals/` | mapped | Contradiction handling is now explicit process truth. |
| `shared/mesh-contracts/` | SessionKernelBox | `shared/mesh-contracts/` | preserved | Already correctly shaped as neutral contracts. |
| `tianezha_master_pack/` | ArchivistBox, PublicReadinessBox | `world/registries/`, `ASSEMBLY.md` | mapped | Product pack becomes visible assembly truth. |
