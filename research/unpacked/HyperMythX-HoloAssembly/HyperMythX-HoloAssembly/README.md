# HyperMythX · HoloAssembly

HyperMythX is a **bounded living-world creator shell**.

It combines:
- **Rust** for canonical truth
- **Unity** for lightweight 3D + VR embodiment
- **xLua** for the in-world coding shell and session-state language
- **Next.js** for the operator panel
- **Firestore** for mirrored logs and snapshots

## Core world limits
- World size: **42 × 42 × 42** voxels
- Max active agents: **16**
- Modes: **Builder**, **Director**, **Coder**

## Main fantasy
Inside VR or desktop mode, you can tell an agent to:
- build voxel structures
- grow ASCII organisms / architecture
- stage a chess room
- create cinematic recap jobs
- open a Lua terminal and control the world live

## Architecture
```text
Rust = truth
Unity = body
xLua = language
Next.js = control
Firestore = mirror
```

## Repo map
- `crates/hmx-core` — canonical state kernel
- `crates/hmx-protocol` — shared protocol types
- `crates/hmx-bridge` — HTTP/WebSocket bridge skeleton
- `apps/web` — operator panel
- `unity-client` — Unity project shell
- `scripts/lua` — session/world/agent/build/media shell scripts
- `docs` — charter, constitution, implementation order, Codex prompt

## What is already included
This starter repo includes:
- architecture docs
- implementation order
- Rust starter structs and routes
- Next.js starter operator dashboard
- Unity C# bridge stubs
- Lua shell files
- a copy-paste Codex prompt

## What is NOT included yet
- a full Unity `.unitypackage`
- xLua binaries
- full VR locomotion
- final voxel meshing implementation
- production auth or payments

## Local run overview
### 1) Rust kernel
Run in **VS Code terminal**:
```bash
cd crates/hmx-core
cargo run
```

### 2) Web operator panel
Run in **VS Code terminal**:
```bash
cd apps/web
npm install
npm run dev
```

### 3) Unity project
Open `unity-client` in **Unity Hub** as a project folder.
Then import xLua into `Assets/XLua`.

## Gotchas
- Do **not** let Unity become the authority.
- Do **not** let Lua directly commit authoritative truth.
- Keep the world bounded at `42³` for performance.
- Use chunk meshes, not one GameObject per block.
- Keep mobile companion-first later; do not force full VR parity on mobile first.
