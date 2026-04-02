# Unity Setup

## Open this project
1. Install **Unity Hub**.
2. Create/open a Unity project using the `unity-client` folder.
3. Import xLua into `Assets/XLua`.
4. Keep Lua scripts in `Assets/StreamingAssets/Lua`.

## Initial scripts to wire
- `Assets/Scripts/Core/RustStateClient.cs`
- `Assets/Scripts/Core/LuaRuntime.cs`
- `Assets/Scripts/Core/LuaContext.cs`
- `Assets/Scripts/World/VoxelChunkRenderer.cs`
- `Assets/Scripts/VR/CreatorShellRig.cs`
- `Assets/Scripts/Agents/AgentView.cs`
- `Assets/Scripts/Chess/ChessBoardView.cs`

## First milestone in Unity
- Show a simple floor or chunk placeholder
- Fetch `/snapshot` from the Rust kernel
- Render 1–4 cube agents from snapshot data
- Open terminal and run a sample Lua command
- Keep all big edits as preview-first

## Gotchas
- Do not use one GameObject per voxel.
- Build chunk meshes later.
- Keep Lua sandboxed through a safe context object.
