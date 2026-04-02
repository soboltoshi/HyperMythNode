# Hermes Agent

**What it is:** A vendored autonomous-agent adapter that can operate inside this assembly world without becoming the world itself.

## What it does

- provides a capable upstream autonomous agent runtime
- can host skills, spawn sub-agents, and perform scoped tasks
- acts as an implementation-side worker behind the `HermesAgentBox`

## How to use it in this repo

- treat Hermes as an external block dependency described by `world/adapters/HermesAgentAdapter.md`
- keep its upstream runtime under `agents/vendor/hermes-agent/`
- define any local role it plays through clauses and interfaces instead of editing assembly governance around Hermes internals

## Connects to

- [block-builder.md](block-builder.md)
- [g0dm0d3.md](g0dm0d3.md)
- [interface-assembly.md](interface-assembly.md)
- [../GISTBOOK.md](../GISTBOOK.md)

## Limits

- Hermes may execute work, but it does not define world law
- its skills and tools are upstream implementation details until the local world promotes something into a shared interface
- any cross-block change still goes through `Arbiter`, `WorldBuilder`, and `Archivist`

## Where it lives

`agents/vendor/hermes-agent/`

Clause: [world/clauses/HermesAgentBox.md](../world/clauses/HermesAgentBox.md)
