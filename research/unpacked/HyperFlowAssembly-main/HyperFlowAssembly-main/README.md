# GTA Finance / SessionMint Interface Assembly

This repository now contains both layers of the assembly:

- the constitutional world pack in `world/`
- the executable workspace scaffold in `apps/`, `nodes/`, `packages/`, and `shared/`

The reference repositories under `C:\SessionMint\Tianezha` and `C:\SessionMint\tianshi-network` were used only to extract boundary truth and route shape. They are not the owner of truth for this repository.

## Included
- `world/WORLD.md`
- 25 sovereign block clause files in `world/clauses/`
- shared interfaces in `world/interfaces/`
- adapters in `world/adapters/`
- proposals in `world/proposals/`
- registries in `world/registries/`
- executable workspace scaffold in `apps/`, `nodes/`, `packages/`, and `shared/`
- validation script in `scripts/validate-assembly.mjs`
- smoke-style contract test in `tests/assembly-validation.test.mjs`

## Repo Shape
- `world/`: constitutional truth, ownership boundaries, proposals, registries, and merkle snapshot
- `apps/`: branded and operational surfaces
- `nodes/`: sovereign node manifests and trust policies
- `packages/`: shared contracts, router, jobs, workers, storage, media, agents, and adapters
- `shared/`: neutral mesh contracts and knowledge-base scaffolding

## Commands
- `npm run sync:surfaces`: regenerate app manifests, route files, and the world route registry from the canonical shared surface contract
- `npm run validate`: validate the assembly graph, manifests, and registries
- `npm test`: run the contract-level smoke test

No external install is required for the validation flow. The scripts run on the Node runtime already present on the machine.

## Core Thesis
This system is a 4-chain world activation network:
- Solana
- BNB
- Base
- Ethereum

It supports:
- token worlds
- sovereign non-token worlds
- public/private superbrain routing
- useful-compute markets
- CPI69 and MYTHIV42
- Windows-only desktop embodiment
- web/mobile/chatbot finance surfaces
- Hyperliquid derivatives
- video generation across desktop, web, Telegram, and WeChat

## Trust Rules
- External systems are adapters, not truth owners.
- The public Tianezha router is the only bridge between the private brain and sub-agents.
- The private brain is backend-only and may only send to one hardcoded allowed wallet.
- MYTHIV42 agents are Conway-only.
- Public/world agents may use the cheapest approved runtime.
