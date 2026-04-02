# Unity Client

Release priority:

- first functional release target: Meta Quest 3
- required modes: proper VR and mixed reality
- desktop shell remains a support and authoring path

Initial Unity folder scaffold:

- `Assets/Scripts/Core`
- `Assets/Scripts/World`
- `Assets/Scripts/Embodiment`
- `Assets/Scenes`
- `Assets/StreamingAssets/Lua`

Planned first systems:

- Quest 3 embodiment shell
- wrist menu and floating terminal
- hologram build preview
- room-anchored mixed reality layout
- Lua creator shell bridge
- ASCII voxel creator mode
- Flex-style spectral texture fields across bounded `42 x 42 x 16` worlds

Production stack now implemented in-scene:

- `Assets/Scripts/Embodiment/QuestXriStackBootstrap.cs`
  runtime installer for `XROrigin` + `XRInteractionManager` when XRI packages are available.
- `Assets/XR/QuestXriActions.inputactions`
  action map asset for left and right Quest controllers.
- `Assets/Scripts/Voxel/VoxelWorldRuntime.cs`
  bounded voxel world generation (MiniMinecraft-style biome and block rules).
- `Assets/Scripts/Voxel/VoxelCreatorController.cs`
  in-hand block placement and removal logic.
- `Assets/Scripts/Voxel/VoxelHologramPreview.cs`
  ghost block preview before placement.
- `Assets/Scripts/Voxel/VoxelWristMenu.cs`
  left-hand anchored wrist menu with current block state.
- `Assets/Scripts/Voxel/VoxelFloatingTerminal.cs`
  floating command terminal in front of the headset.
- `Assets/Scripts/Voxel/VoxelLuaBridge.cs`
  Lua-like command bridge for script-driven world edits from `StreamingAssets/Lua`.
- `Assets/Scripts/Embodiment/QuestVoiceBridge.cs`
  headset mic capture and companion transcription bridge. Audio uploads are sent to the desktop companion, which returns a transcript and routing summary. The transcript is then forwarded to the kernel as `quest3.voice.command`.
- `Assets/Scripts/Voxel/VoxelLocomotionController.cs`
  joystick locomotion with fly/swim/jump semantics and voxel collision checks.

Current first-scene scaffold:

- `Assets/Scripts/Core/KernelDtos.cs`
  typed Unity mirror of the Rust `/health`, `/snapshot`, and `/command` payloads
- `Assets/Scripts/Core/KernelClient.cs`
  HTTP bridge for the Rust kernel endpoints
- `Assets/Scripts/World/WorldBoundsRenderer.cs`
  runtime wireframe stage for the bounded `42 x 42 x 16` world
- `Assets/Scripts/Embodiment/QuestStageController.cs`
  first Quest 3 stage bootstrap for VR or MR mode

Suggested scene object layout:

- `KernelBridge`
  attach `KernelClient`
- `QuestStageRoot`
  attach `QuestStageController`
- `WorldBoundsFrame`
  attach `WorldBoundsRenderer`
- `WorldRoot`
  assign as the stage anchor for room-scale content

HyperCinema cinema surface scripts (new):

- `Assets/Scripts/Cinema/HyperCinemaDtos.cs`
  Unity-serializable mirrors of all lx-protocol HyperCinema types:
  service manifest, studio/style presets, job request, job, scene cards,
  output manifest, job list response, and report response.
- `Assets/Scripts/Cinema/HyperCinemaClient.cs`
  HTTP client for the HyperCinema kernel endpoints (`/api/service`,
  `/api/jobs`, `/api/jobs/{id}`, `/api/report/{id}`). Coroutine-based,
  mirrors the KernelClient pattern. Context-menu test hooks included.
- `Assets/Scripts/Cinema/HyperCinemaSurfaceController.cs`
  First cinema surface controller. Fetches the service manifest on boot,
  exposes `CreateJobFromContext(studio, coreIdea)` for VR gesture triggers,
  and sends a `hypercinema.job.ready` command to the kernel truth layer
  via KernelClient when a job is created.

Suggested cinema scene object:

- `HyperCinemaBridge`
  attach `HyperCinemaClient` + `HyperCinemaSurfaceController`
  assign `KernelClient` reference (shared with QuestStageController or standalone)

Kernel connection notes:

- editor default may use `http://127.0.0.1:8787`
- Quest 3 hardware cannot use editor loopback directly
- for on-device testing, either:
  - set `KernelClient` Base Url to the host machine LAN address, or
  - use `adb reverse tcp:8787 tcp:8787` during debug sessions

Stage bootstrap behavior:

- fetches `/snapshot`
- renders the room-scale bounded world frame
- sends a `quest3.stage.command` ready receipt back to `/command`
- exposes context-menu hooks for room anchor and build preview command tests

Quest controls in runtime:

- Left grip: toggle fly mode
- Left thumbstick: move horizontally
- Left trigger: jump (ground) / ascend (fly or swim)
- Left primary button: toggle wrist menu + send room-anchor command
- Left secondary button: toggle floating terminal
- Left grip: voice capture / stop capture
- Right trigger: place selected block
- Right grip: remove targeted block
- Right primary button: cycle selected block
- Right secondary button: run current terminal preset + send build-preview command

Lua bridge command examples:

- `help`
- `set 21 10 21 Gold`
- `fill 18 8 18 24 8 24 Stone`
- `slice 8`
- `load_ascii structures/camp.txt 16 9 16`
- `run startup.lua`
