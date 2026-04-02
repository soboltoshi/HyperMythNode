Build HyperMyths as a local-first modular monorepo using Interface Assembly.

HyperMyths = whole network.
MYTHIV = hardcore finance router.
Aghori = public agent.
Tianshi = private agent.

Stack:
- Next.js + TypeScript apps
- Node + TypeScript boxes/workers/adapters
- SQLite local first
- local filesystem storage first
- Ollama local-first AI inference
- OpenRouter hosted fallback
- Hugging Face task-specific fallback

Rules:
- Every major component must be classified as box, interface, adapter, client, worker, rail, vault, or index.
- Shared contracts go in packages/protocol.
- AI provider access goes only through packages/ai-gateway.
- Adapters never own truth.
- Browser clients are never authoritative.
- Generate runnable stubs first.

First-wave boxes:
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

Required provider adapters:
- adapters/ollama
- adapters/openrouter
- adapters/huggingface

Required first contracts:
- WorldContract
- SessionContract
- ComputeQuoteContract
- PredictionMarketContract
- LivestreamRoomContract
- MediaJobContract
- AgentTaskContract
- AIRequestContract
- AIResponseContract

Build order:
1. scaffold workspace
2. protocol + ai-gateway
3. web + api rail
4. session/world boxes
5. mythiv/computation indexes
6. agents + provider adapters
7. hashmedia
8. livestream
9. prediction/futarchy
10. cancerhawk

Provide README files for every block with purpose, runtime, inputs, outputs, dependencies, and gotchas.
