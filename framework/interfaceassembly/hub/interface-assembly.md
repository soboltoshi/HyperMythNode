# Interface Assembly

**What it is:** A markdown-first operating model for building software as named boxes, shared interfaces, and edge adapters.

## What it does

- names each sovereign box and its role
- separates local ownership from shared contracts
- treats external repos and tools as adapters instead of hidden internals
- keeps every decision visible through clauses, amendments, registries, and the gistbook

## The core idea

Interface Assembly starts with the world, then the boxes, then the interfaces. A box owns one bounded concern. Shared contracts live in the interface layer. External tools, repos, and upstream projects sit at the edge as adapters. Governance is explicit:

- `WorldBuilder` classifies and authorizes structure
- `BlockBuilder` defines one new target at a time
- `Arbiter` resolves cross-box conflicts
- `Archivist` records the accepted state
- `PublicReadiness` decides whether the package is fit to hand to others

## The working loop

1. Write or update the proposal in `world/proposals/`.
2. Let `WorldBuilder` classify the work as a box, interface, adapter, sidecar, or reference.
3. Use `BlockBuilder` to define the target's local role, dependencies, and reports.
4. Promote repeated connections into `world/interfaces/`.
5. Record any external edge in `world/adapters/`.
6. If another block must change, route it through `Arbiter` and `WorldBuilder`.
7. Let `Archivist` update the amendment chain, registries, and merkle record.
8. Run `PublicReadiness` before publishing the repo as a reusable hub.

## What you get

- a world map in `world/WORLD.md`
- sovereign clauses in `world/clauses/`
- reusable contracts in `world/interfaces/`
- edge descriptions in `world/adapters/`
- machine-readable registries in `world/registries/`
- public hub cards in `hub/`
- agent operating notes in `agents/`

## Connects to

- [block-builder.md](block-builder.md) for scoped box creation
- [interface-registry.md](interface-registry.md) for shared contracts and adapters
- [archivist.md](archivist.md) for amendment custody
- [arbiter.md](arbiter.md) for cross-box conflict handling
- [worldbuilder.md](worldbuilder.md) for classification and role authority
- [public-readiness.md](public-readiness.md) for release gating

## Limits

- Interface Assembly gives structure, not automatic implementation
- a block agent may not silently mutate another block
- shared contracts only become canonical when the interface layer accepts them
- public release still requires a readable package, not just an internally coherent one
