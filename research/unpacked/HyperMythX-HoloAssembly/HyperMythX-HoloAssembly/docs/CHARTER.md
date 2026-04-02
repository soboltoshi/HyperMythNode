# HyperMythX Charter

## Mission
Build a compact living world where session-state, computation, creation, coordination, and generated media all flow through one bounded creator shell.

## Product thesis
HyperMythX is not just a game and not just a dashboard. It is a **creator shell** that turns commands, agent actions, and digital events into a controlled world state and then manifests that state as voxels, ASCII forms, chess states, UI surfaces, and optional media outputs.

## Design laws
1. **Truth is singular.** Rust is the final authority.
2. **Language is live.** Lua is the in-world shell language.
3. **Embodiment is separate.** Unity renders and interacts; it does not own truth.
4. **The world is bounded.** 42 × 42 × 42 keeps the prototype dense and fast.
5. **Agents are capped.** No more than 16 active agents in the first build.
6. **Every large action previews first.** Ghost preview before commit.
7. **Everything meaningful becomes a structured command.**
8. **Media is an output adapter, not the core loop.**

## Modes
- **Builder** — create or edit the world
- **Director** — assign tasks and stage scenes
- **Coder** — use the Lua shell directly
