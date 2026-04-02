# Implementation Order

## Stage 1 — Rust truth kernel
Build first:
- `AppState`
- `WorldGrid`
- `AgentState`
- `SessionPhase`
- timers
- command validation
- snapshot endpoint
- command endpoint

Run in:
- **VS Code terminal**

Commands:
```bash
cd crates/hmx-core
cargo run
```

## Stage 2 — Web operator panel
Build next:
- live snapshot viewer
- active agents panel
- active timers panel
- log output panel
- command test box

Run in:
- **VS Code terminal**

Commands:
```bash
cd apps/web
npm install
npm run dev
```

## Stage 3 — Unity world shell
Build next:
- chunk renderer placeholder
- terminal panel
- simple desktop camera
- world snapshot client
- 4 test agents

Run in:
- **Unity Hub** → open `unity-client`

## Stage 4 — xLua integration
- import xLua into `Assets/XLua`
- wire `LuaRuntime.cs`
- expose safe `LuaContext`
- load scripts from `Assets/StreamingAssets/Lua`

## Stage 5 — VR creator shell
- XR rig
- wrist menu
- selection ray
- preview ghost
- terminal in world

## Stage 6 — chess room + delegated build agents
- board room
- move requests
- agent build tasks
- media recap jobs
