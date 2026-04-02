# HyperMyths

HyperMyths is the whole network and world universe.

MYTHIV is the hardcore finance router inside HyperMyths.

This repo is a **local-first HyperFlow assembly** for building HyperMyths with a modular Interface Assembly approach.

## Local-first stack

- Next.js + TypeScript for web/admin/creator apps
- Node + TypeScript for boxes, workers, rails, and adapters
- SQLite for local persistence first
- Local filesystem storage for media/artifacts first
- Ollama adapter for local inference
- Hugging Face adapter for hosted/serverless model calls
- OpenRouter adapter for multi-model fallback

## AI routing rule

The repo includes a provider-gateway pattern:

- **Ollama first** for local/private inference
- **OpenRouter second** for model diversity and fallback
- **Hugging Face third** for task-specific hosted inference

The `packages/ai-gateway` package owns routing policy.

## Run locally

Tools you need on your desktop:

- Node.js 22+
- pnpm
- Git
- VS Code
- Ollama (optional but recommended)
- Python 3.11+ only if you later add SAM/media worker steps

### Install

```bash
pnpm install
```

### Start web app

```bash
pnpm --filter web dev
```

### Start admin app

```bash
pnpm --filter admin dev
```

### Start creator app

```bash
pnpm --filter creator dev
```

### Start local workers

```bash
pnpm --filter agent-worker dev
pnpm --filter hashmedia-worker dev
pnpm --filter stream-worker dev
```

## First milestone

Build this loop first:

1. create a world
2. list it in the directory
3. assign one Aghori or Tianshi task
4. create one compute quote
5. submit one media job
6. create one prediction market
7. render all of that in the web UI

## Gotchas

- Do not make browser clients authoritative.
- Do not put provider logic directly in business boxes.
- Do not call external AI APIs directly from random routes; use `packages/ai-gateway`.
- Do not start with the voxel engine first.
