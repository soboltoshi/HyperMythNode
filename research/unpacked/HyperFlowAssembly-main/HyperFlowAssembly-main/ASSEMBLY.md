# Combined Assembly

## Layers
- `world/` owns the constitutional truth.
- `apps/`, `nodes/`, `packages/`, and `shared/` own the executable truth.
- `Tianezha` and `tianshi-network` were used only as extraction references.

## Runtime Split
- `apps/larpa-web`: private-first customer surface
- `apps/hashart-web`: public-first discovery surface
- `apps/mythiv-web`: broker and handoff surface
- `apps/tianezha-admin`: operator, governance, moderation, and audit surface
- `nodes/tianezha`: peer compute node and public router
- `nodes/larpa`: private-first service seller node
- `nodes/hashart`: public-first service seller node
- `nodes/mythiv`: sovereign broker and settlement node

## Shared Packages
- `packages/shared-types`: frozen contracts
- `packages/shared-ui`: shared shell, navigation, and layout-region contracts
- `packages/shared-router`: commerce intents, quotes, assignments, receipts
- `packages/shared-workers`: worker registry and dispatch
- `packages/shared-jobs`: workflow lifecycle and queue rules
- `packages/shared-storage`: storage abstractions
- `packages/shared-media-core`: ingest and reference normalization
- `packages/shared-agents`: public/private brain and agent routing policy
- `packages/adapters/tianezha`: edge-only adapter helpers
- `shared/mesh-contracts`: neutral mesh contracts

## Implementation Order
1. Freeze constitutional ownership.
2. Freeze node manifests and trust rules.
3. Freeze shared contracts and route manifests.
4. Freeze extraction ledger from the legacy monolith.
5. Validate that every runtime path points back to an owner box.
