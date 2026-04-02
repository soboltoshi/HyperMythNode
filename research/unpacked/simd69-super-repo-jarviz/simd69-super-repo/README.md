# SIMD69 Super Repo

A starter monorepo for the **SIMD69 ordering adapter** with a named shell agent and a lightweight security layer.

This repo is built around a simple rule:

- **Rust** is canonical truth
- **Lua** is lightweight world scripting
- **TypeScript** powers the natural-language shell
- **Research docs** live beside the code so the implementation stays tied to the theory
- **JarWiz Security** is the guardrail layer for intent validation, operator permissions, and safe world mutation

## Named agents

- **JarViz** — the shell agent for natural-language command intake, parsing, and safe command handoff
- **JarViz VR** — the in-world VR-facing agent persona for guidance, system prompts, and diegetic shell feedback

## What is inside

- `kernel/order/simd69/` — Rust crate for ordering, scoring, constraints, fallback ordering, receipts, and JarWiz Security policy
- `game/scripts/` — Lua worldgen, agent behavior, and shell macro examples
- `apps/cli/` — TypeScript natural-language shell for JarViz
- `docs/papers/` — paper and one-pager drafts
- `docs/security/` — JarWiz Security notes
- `research/` — prompt archive, generated research, and conversation transcript

## Recommended stack

- Rust for deterministic kernel logic
- Lua for procedural generation and gameplay scripting
- LÖVR for the lightweight 3D/VR runtime
- Node.js for the NL shell

## How to run

### 1. Rust tests
Run from:

```bash
cd kernel/order/simd69
cargo test
```

### 2. TypeScript shell
Run from:

```bash
cd apps/cli
npm install
npm run dev -- "JarViz spawn 4 scout agents near red anomaly and prioritize cheap compute"
```

### 3. Lua scripts
These are starter scripts intended to be loaded by your game runtime. If you use **LÖVR**, place the `game/scripts` logic inside your project folder and require it from `main.lua`.

## Dependencies

- Rust + Cargo
- Node.js 20+
- TypeScript
- LÖVR (recommended for the game runtime)

## Gotchas

- Do not let JarViz directly mutate world state. It should only produce **validated intents**.
- Keep the optimizer as a **proposal layer**. Canonical state still belongs to the Rust kernel.
- Keep procedural generation seeded and deterministic.
- Keep the game loop lightweight. Expensive jobs should become compute-market jobs rather than blocking the render loop.
- Keep JarWiz Security ahead of world mutation, receipt emission, and operator actions.
