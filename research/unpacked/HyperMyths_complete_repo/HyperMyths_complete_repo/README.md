# HyperMyths

HyperMyths is the overall network and world universe.

This repository is a **buildable local-first monorepo starter** for HyperMyths, centered on a deterministic session-state kernel and modular world boxes.

## What is actually inside this repo

This repo is opinionated and runnable:

- **Next.js App Router** web app in `apps/web`
- **Firebase App Hosting-ready** layout with `apphosting.yaml`
- **Local JSON persistence first** so you can run without cloud setup
- **Shared protocol contracts** in `packages/protocol`
- **Business logic** in `packages/core`
- **Filesystem store** in `packages/store`
- **Named HyperMyths boxes** wrapping the core services
- **Successor prompts** for future chats and Codex handoff
- **Audit docs** summarizing what was strong and weak in the uploaded repo packs

## Core HyperMyths framing

- **HyperMyths** = the network and world universe
- **MYTHIV** = the hardcore finance router inside HyperMyths
- **SessionKernel** = deterministic session-state truth
- **WorldSpawn** = create new worlds
- **WorldDirectory** = index and discover worlds
- **HashMedia** = media job and reporting layer
- **CancerHawk** = useful-work routing shell
- **AgentMesh** = tasking and agent coordination
- **ComputationMarket** = compute quotes and routing
- **MediaSurface** = future output and overlay surfaces
- **DesktopWorld** = future desktop-heavy embodiment

## Stack

- **Next.js 16+**
- **React 19**
- **TypeScript**
- **pnpm workspaces**
- **Turbo**
- **Firebase App Hosting**
- **Node.js 22+**

## Run locally

Open the repo in **VS Code** and run these in the integrated terminal:

```bash
pnpm install
pnpm dev
```

Then open:

```bash
http://localhost:3000
```

## Main folders

- `apps/web` — main web app
- `packages/protocol` — shared schemas and contracts
- `packages/config` — environment parsing
- `packages/store` — local JSON persistence
- `packages/core` — business logic and services
- `boxes/*` — named HyperMyths modules
- `workers/*` — local worker entrypoints
- `interface-assembly` — ownership and world law docs
- `successor-prompts` — prompts to continue in new chats

## Important gotchas

- The browser is **never** the source of truth.
- The **session kernel** should be the only canonical writer for session state.
- Do not put chain logic directly into UI routes.
- Do not make adapters own truth.
- Do not add Firebase-only assumptions to business logic; keep local-first first.
- This repo is a **real starter foundation**, not a full production protocol.
