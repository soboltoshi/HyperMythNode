# Voxel Engine Integration

This repo now ships with three coordinated voxel tracks:

1. `external/Blackvoxel` (vendored upstream engine, GPL)
2. `external/MiniMinecraft` (vendored upstream assignment engine)
3. `apps/unity-client` production Quest runtime that merges:
   - Blackvoxel-style ASCII block mapping workflow
   - MiniMinecraft-style biome, terrain, block semantics, and interaction rules

## Install / Update external engines

```powershell
cd C:\hypermythsX
.\scripts\install-voxel-engines.ps1
```

Optional Blackvoxel native build attempt:

```powershell
.\scripts\install-voxel-engines.ps1 -BuildBlackvoxel
```

## Unity merged gameplay location

- `Assets/Scripts/Voxel/VoxelBlockType.cs`
- `Assets/Scripts/Voxel/VoxelBlockRules.cs`
- `Assets/Scripts/Voxel/VoxelTerrainGenerator.cs`
- `Assets/Scripts/Voxel/VoxelWorldRuntime.cs`
- `Assets/Scripts/Voxel/VoxelCreatorController.cs`
- `Assets/Scripts/Voxel/VoxelLuaBridge.cs`

## ASCII block workflow

- Glyph mapping is defined in `VoxelBlockRules`.
- ASCII import command:
  - `load_ascii structures/camp.txt 16 9 16`
- ASCII slice export command:
  - `slice 8`

Lua startup script:

- `Assets/StreamingAssets/Lua/startup.lua`

## Runtime interaction loop

- In-world editing through Quest controllers
- Wrist menu for selected block state
- Floating terminal for scripted operations
- Hologram preview before placement
- Voxel locomotion with fly/swim/jump semantics

## Licensing note

`external/Blackvoxel` is GPL-licensed upstream code.
It is kept as a vendored external reference in this repository.
If you redistribute binaries that directly include GPL code, review GPL obligations.
