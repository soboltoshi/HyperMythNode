# Arbiter Decision: HyperCinema Adapter Classification

Date: 2026-04-02
Decision ID: ARB-2026-04-02-HYPERCINEMA-ADAPTER

## Decision

`HyperCinemaAdapter` is classified as an adapter, not a sovereign box.

## Ruling

- External video generation is routed through `PrivateBrainRouterBox` only.
- Cami may propose cinema work but cannot dispatch cinema jobs.
- User confirmation is required before kernel command dispatch.
- `TruthKernelBox` records the experiment before worker polling.
- Hermes worker polling does not own truth or money state.
- Money settlement path is fixed:
  `PrivateBrainRouterBox` -> `RouterMoneyInterface` -> `SolanaAgentKitAdapter`.

## Boundary protection

- `EmbodimentBox` is display-only for returned video URLs.
- Hermes workers must not hold payment keys, wallet seeds, or direct money tools.
