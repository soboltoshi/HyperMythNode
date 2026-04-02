# HyperMyths

HyperMyths is the network and world universe.

MYTHIV is the hardcore finance router inside HyperMyths.
Aghori is the public/external agent.
Tianshi is the private/internal agent.

## Stack
- Next.js + TypeScript for apps
- Node + TypeScript for boxes, adapters, workers, rails
- pnpm workspaces + Turbo
- Firebase App Hosting for web deployment
- No Vercel

## How to run
Run these in VS Code terminal:

```bash
pnpm install
pnpm dev
```

The current repo is a scaffold with runnable stubs and docs, not full production logic.

## Workspace layout
- `apps/` user-facing apps
- `packages/` shared contracts and types
- `boxes/` sovereign modules
- `adapters/` external bridges
- `workers/` async/background jobs
- `rails/` transport layers
- `vaults/` persistence boundaries
- `indexes/` computed read layers
- `interface-assembly/` architecture law mirror
