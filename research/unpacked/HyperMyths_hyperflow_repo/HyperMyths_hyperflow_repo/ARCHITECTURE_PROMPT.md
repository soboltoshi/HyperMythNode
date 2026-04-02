# Architecture Prompt

Use Interface Assembly rules.

- One owner per box.
- Shared contracts live in `packages/protocol`.
- External integrations live in adapters.
- Clients are not authoritative.
- Boxes do not mutate other boxes directly.
- AI providers must be called through `packages/ai-gateway` only.
- Local-first means SQLite + local filesystem + local Ollama before any cloud dependence.
