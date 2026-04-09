# Last Experiments work in progress not production ready. just a scaffold for you to catch up! 

HyperFlow Tianezha Interface Assembly scaffold.

Current release priority:

- first functional release: Meta Quest 3
- first embodiment target: proper VR plus mixed reality
- secondary surfaces: web webcam games
- later surface: mobile companion
- bounded world target: 42 x 42 x 16

Canonical stack:

- Rust truth kernel
- Unity embodiment
- Lua-style creator shell
- `claw-code-adapter` desktop shell wrapper
- `claw-companion` desktop private brain / voice companion
- Contactway native adapter path (kernel Rust endpoints + companion/web/VR bridge)
- `solana-agent-kit` shared blockchain capability bridge for all agents
- Next.js operator and webcam surface
- Hermes-agent role mesh
- GODMODE runtime surface (vendored)
- Interface Assembly agent packs + constitution layers

This scaffold starts the box layout without expanding authority beyond the constitution.

Runtime notes:

- Kernel state is persisted at `build/kernel/state.json` (override with `KERNEL_STATE_FILE`).
- Web HyperCinema surface reads `NEXT_PUBLIC_KERNEL_URL` with localhost fallback.
- Unity `KernelClient` and `HyperCinemaClient` support runtime endpoint overrides via:
  - PlayerPrefs key `lastexperiments.kernel.url`
  - environment variable `LAST_EXPERIMENTS_KERNEL_URL`
- Quest voxel gameplay stack is now implemented under `apps/unity-client/Assets/Scripts/Voxel` with:
  - MiniMinecraft-style biome terrain generation
  - ASCII voxel palette + Lua command bridge
  - wrist menu, floating terminal, hologram preview, and hand-driven block editing
- Quest voice bridge is implemented under `apps/unity-client/Assets/Scripts/Embodiment/QuestVoiceBridge.cs`:
  - headset mic capture
  - local Whisper-style desktop companion transcription bridge
  - `quest3.voice.command` handoff into the kernel
- Web operator instructions are exposed at `apps/web/app/operator/page.tsx` and route through the same companion/kernel stack.
- Solana Agent Kit is installed as a shared agent capability under `agents/solana-agent-kit` with HTTP and MCP modes.
- External voxel engines are vendored under `external/Blackvoxel` and `external/MiniMinecraft`.
  - Re-sync with `.\scripts\install-voxel-engines.ps1`.
- Hermes/ASIMOG runtime server is runnable at `agents/hermes/runtime`:
  - `npm --prefix agents/hermes/runtime run start`
  - default endpoint: `http://127.0.0.1:8799`
- Desktop companion is runnable at `desktop/claw-companion`:
  - `npm --workspace desktop/claw-companion run serve`
  - `npm --workspace desktop/claw-companion run brain -- "your prompt"`
- Contactway adapter status/control is exposed at:
  - kernel: `GET/POST /api/contactway/*`
  - companion proxy: `GET/POST /contactway/*`
  - web desktop GUI: `apps/web/app/operator/page.tsx`
- Native adoption analysis is documented in `docs/contactway-native-adoption.md`.

Quest on-device networking (LAN)

- Quest cannot reach `127.0.0.1`; set `KERNEL_BASE_URL` and `NEXT_PUBLIC_KERNEL_URL` to your host LAN IP (for example, `http://192.168.1.50:8787`).
- In Unity, set `KernelClient` base URL to the same LAN value or push `PlayerPrefs` key `lastexperiments.kernel.url`.
- For tethered debugging you can `adb reverse tcp:8787 tcp:8787` so the headset hits your desktop kernel.
