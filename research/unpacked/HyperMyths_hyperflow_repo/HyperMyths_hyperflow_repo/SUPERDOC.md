# SUPERDOC

## Canonical naming

- **HyperMyths** = total network and world universe
- **MYTHIV** = hardcore finance router inside HyperMyths
- **Aghori** = external/public agent
- **Tianshi** = private/internal agent
- **HashMedia** = media engine
- **CancerHawk** = useful-work router

## Main architecture rule

Build everything as named Interface Assembly blocks.

Each meaningful unit must be one of:

- Box
- Interface
- Adapter
- Client
- Worker
- Rail
- Vault
- Index

## Local-first AI routing

All LLM or inference calls must route through `packages/ai-gateway`.

### Provider priority

1. `ollama`
2. `openrouter`
3. `huggingface`

### Why

- local first for speed and privacy
- hosted fallback when local is insufficient
- task-specific model choice through one common interface

## Core boxes

- session-kernel
- world-spawn
- world-directory
- mythiv
- aghori
- tianshi
- agent-mesh
- computation-market
- hashmedia
- cancerhawk
- livestream-surface
- prediction-engine
- futarchy-engine
- perps-index-engine

## Required contracts

- WorldContract
- SessionContract
- ComputeQuoteContract
- PredictionMarketContract
- LivestreamRoomContract
- MediaJobContract
- AgentTaskContract
- AIRequestContract
- AIResponseContract

## Provider adapters

- adapters/ollama
- adapters/openrouter
- adapters/huggingface

## Example routing rules

- private reasoning or operator-side local summaries -> Ollama first
- public-facing long-form or fallback chat -> OpenRouter
- embeddings/classification/task-specific hosted inference -> Hugging Face

## First complete local loop

- world-spawn creates a world
- world-directory indexes the world
- mythiv accepts a compute quote
- agent-mesh assigns a task to Aghori or Tianshi
- hashmedia creates a media job
- prediction-engine creates a market on that world
- apps/web displays the result
