# Codex Super Prompt — HyperMythX HoloAssembly

Build a monorepo called HyperMythX-HoloAssembly.

Core architecture:
- Rust is the canonical truth engine.
- Unity is the world renderer and VR/desktop embodiment runtime.
- xLua is the session-state language and in-world coding shell.
- Next.js is the operator dashboard.
- Firestore mirrors logs and snapshots but is not authoritative.

World constraints:
- Bounded voxel world: 42 x 42 x 42
- Maximum active agents: 16
- Primary product fantasy: lightweight VR creator shell / godmode creative mode
- Integrated chess chamber inside the world
- ASCII manifestations are first-class outputs

Create these top-level folders:
- apps/web
- crates/hmx-core
- crates/hmx-protocol
- crates/hmx-bridge
- unity-client
- scripts/lua
- docs

Rust requirements:
1. Define AppState with:
   - world grid occupancy
   - active agents
   - session phase
   - timers
   - build receipts
   - media job queue
2. Expose HTTP routes:
   - GET /snapshot
   - POST /command
   - GET /health
3. Add command types:
   - BuildBox
   - SpawnAgent
   - MoveAgent
   - RequestChessMove
   - QueueMediaJob
   - ChangePhase
4. Validate bounds and caps.
5. Keep all structs serde-serializable.

Unity requirements:
1. Create world shell systems:
   - CreatorShellRig
   - WristMenu
   - TerminalPanel
   - CommandPreviewGhost
   - VoxelChunkRenderer
   - AgentView
   - ChessBoardView
   - RustStateClient
2. Add xLua bridge classes:
   - LuaRuntime
   - LuaContext
3. Load scripts from StreamingAssets/Lua.
4. Keep chunk rendering placeholder-friendly.

Lua requirements:
Create:
- shell.lua
- build.lua
- world.lua
- agent.lua
- ascii.lua
- media.lua
- macros.lua

Lua rules:
- Lua never commits authoritative truth directly.
- Lua requests actions through safe context APIs.
- Separate build, agent, media, and world concerns.

Web requirements:
- Operator dashboard with snapshot viewer
- command tester
- event/log panel
- active phase and agent counters

Implementation rules:
- Rust decides truth.
- Unity renders truth.
- Lua expresses behavior.
- Preview locally, commit authoritatively.
- Keep the prototype dense, bounded, and fast.
