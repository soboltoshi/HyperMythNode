# Last Experiments — Codex Super Prompt

You are building the final bootstrap repo for a project called:

**Last Experiments**

Project subtitle:
**HyperMythX — HoloAssembly Hyperflow Bootstrap**

This is the final top-down repo shape. Do not redesign the stack. Do not replace core architecture. Implement the repo exactly around these truths.

---

## 0. SUPERLATIVE TRUTH

This project is a lightweight creator-shell world.

It is:
- a bounded living voxel / ASCII world
- VR-capable
- desktop-first
- mobile companion later
- agent-directed
- creator-shell-first
- Rust-authoritative
- Unity-rendered
- JavaScript web-controlled

Every creation made through the creator shell is called a:

**Last Experiment**

A Last Experiment can be:
- a voxel structure
- an ASCII organism
- an agent-built construction
- a chess room or chess event
- a cinematic recap request
- a generated scene
- a world script
- a shell macro
- a session-state performance

The system is not just a game.
It is a creator shell and world operating environment.

---

## 1. NON-NEGOTIABLE STACK

Use this stack exactly:
- Rust = canonical truth engine
- Unity = 3D / VR / embodiment client
- Lua-style scripting layer in Unity creator shell
- Web app in JS / Next.js = operator and control surface
- Firebase App Hosting = web deployment target
- Firestore = mirrored state snapshots, logs, queryable history
- Unity OpenXR path for VR compatibility
- bounded world size = 42 x 42 x 42
- max active agents = 16

Important:
- Rust is the only authority for committed truth.
- Unity is not authoritative.
- The scripting layer is not authoritative.
- Web is not authoritative.
- Firestore is not authoritative.

Truth flow:
input -> shell command -> Rust validation -> committed state -> world update -> logs/history

---

## 2. PRODUCT FANTASY

The main fantasy is:

A lightweight VR creator shell where I can tell agents to build anything live:
- voxels
- ASCII forms
- rooms
- chess spaces
- market chambers
- cinematic recaps
- experiments
- shell macros

I should be able to:
- open a wrist menu
- open a floating terminal
- type commands
- later add voice command intake
- preview a build as a hologram
- confirm the build
- delegate builds to agents
- log each creation as a Last Experiment

The world should feel:
- small
- dense
- alive
- stylized
- responsive
- moddable
- scriptable

Not an MMO.
Not an infinite world.
Not a giant survival sandbox.

---

## 3. REPO GOAL

Create a monorepo bootstrap that can actually be built on top of.

The repo must be clean, understandable, modular, and top-down.

It must include:
- architecture docs
- charter docs
- implementation order
- Rust starter
- Unity starter
- shell scripting starter
- web operator panel starter
- protocol definitions
- clear folder structure

Do not create random filler.
Do not create fake integrations.
Do not leave vague TODO-only scaffolding everywhere.
Where logic is stubbed, make the stub clean and intentional.

---

## 4. WORLD RULES

World dimensions:
- 42 x 42 x 42

Chunking:
- use chunk-based rendering strategy
- do NOT use one GameObject per voxel

Agents:
- max 16 active agents
- keep agent forms lightweight first
- simple embodied placeholders are acceptable initially

Core world zones for v1:
- spawn room
- creator shell terminal area
- chess room
- market/computation chamber
- beacon / experiment zone

---

## 5. LAST EXPERIMENTS MODEL

Every shell-driven creation must become a Last Experiment record.

A Last Experiment should include fields like:
- id
- kind
- title
- summary
- creator
- created_at
- command_source
- script_version
- world_location
- status
- outputs
- tags

Kinds may include:
- voxel_build
- ascii_spawn
- agent_task
- chess_event
- media_job
- world_macro
- session_event

Add a clean Rust model for this.
Add mirrored log/read-model support for web UI.

---

## 6. RUST RESPONSIBILITIES

Implement a Rust service as the canonical truth engine.

Suggested:
- axum
- tokio
- serde
- uuid
- chrono

Rust must own:
- canonical AppState
- world bounds
- agent registry
- active sessions
- timers / cooldowns
- experiment records
- authoritative commands
- validation
- receipts / command results
- snapshot output

Create endpoints:
- GET /health
- GET /snapshot
- POST /command

POST /command should accept structured commands.
Do not build an unsafe generic eval endpoint.

Add starter command types such as:
- CreateBox
- SpawnAgent
- MoveAgent
- CreateExperiment
- StartTimer
- RequestChessMove
- PaintZone

Validation rules:
- reject out-of-bounds edits
- reject agent overflow > 16
- reject invalid commands cleanly
- return explicit command result objects

---

## 7. UNITY RESPONSIBILITIES

Unity is the embodiment runtime.

Create a Unity project starter structure that supports:
- desktop first
- VR-ready architecture
- creator shell UI
- chunk rendering placeholders
- agent placeholders
- chess board placeholder
- wrist menu placeholder
- floating terminal placeholder

Add C# starter scripts for:
- RustStateClient
- CreatorShellRig
- WristMenu
- TerminalPanel
- VoxelChunkRenderer
- AgentView
- ChessBoardView
- ExperimentMarkerView
- ShellCommandBridge

Important:
- Unity reads snapshots and command results
- Unity may show local previews
- Unity may NOT silently become the authority

---

## 8. SCRIPTING LAYER RESPONSIBILITIES

Create a Lua-style scripting layer for the creator shell.

It should support starter commands like:
- help()
- build.box(...)
- build.structure(...)
- agent.spawn(...)
- agent.move(...)
- world.paint_zone(...)
- chess.move(...)
- experiment.create(...)
- media.generate_clip(...)

Create starter script files:
- shell.lua
- build.lua
- world.lua
- agent.lua
- chess.lua
- ascii.lua
- media.lua
- macros.lua

The scripting layer should call a narrow safe API bridge.
The scripting layer should not directly mutate authoritative truth.

---

## 9. WEB APP RESPONSIBILITIES

Create a Next.js starter app for operator/control functions.

Use:
- Next.js
- TypeScript optional if desired, but JS-based web stack is acceptable
- simple clean UI
- no unnecessary design bloat

Pages/panels should include:
- current snapshot view
- active agents
- active experiments
- recent command results
- world summary
- implementation notes panel

The web app is for:
- observing
- testing commands
- operator control
- later admin functions

Not for being the truth engine.

---

## 10. FIREBASE RESPONSIBILITIES

Prepare the web app for Firebase App Hosting deployment.

Include:
- firebase.json or appropriate hosting scaffolding if useful
- .env.example
- clear notes on what secrets belong server-side
- Firestore only as mirrored/queryable history and state read model

Do not make Firestore the source of truth.

---

## 11. DOCS TO CREATE

Create these docs:
- README.md
- docs/00_SUPERLATIVE_TRUTH.md
- docs/01_CHARTER.md
- docs/02_BUILD_DOCTRINE.md
- docs/03_IMPLEMENTATION_ORDER.md
- docs/04_PROTOCOL.md
- docs/05_CREATOR_SHELL.md
- docs/06_LAST_EXPERIMENTS.md
- docs/07_OPERATOR_PANEL.md
- docs/08_LOCAL_RUN.md

These docs should be written clearly for a non-expert builder.
Explain:
- what each component is
- where to run it
- how to run it
- what tools are required
- what the gotchas are

---

## 12. FOLDER STRUCTURE

Use a clean monorepo shape like:

last-experiments/
  apps/
    web/
    unity-client/
  crates/
    lx-core/
    lx-protocol/
  scripts/
    shell/
  docs/
  .env.example
  README.md

Inside unity-client, include a clear placeholder structure like:

Assets/
  Scripts/
    Core/
    World/
    Agents/
    Chess/
    UI/
    Networking/
    Shell/
  StreamingAssets/
    Lua/

---

## 13. IMPLEMENTATION STYLE

Code style rules:
- keep files focused
- keep naming readable
- avoid overengineering
- comment important boundaries
- prefer clear starter code over clever abstractions
- stubs are okay if they are honest and useful
- do not fabricate full systems you are not implementing

---

## 14. FIRST MILESTONE

The first milestone must actually be runnable.

It should support:
- run Rust server
- fetch /snapshot
- view snapshot in web app
- Unity client can request snapshot
- one terminal shell command can create a box experiment
- command produces a Last Experiment record
- web app shows that experiment in a list

This first milestone matters more than fancy polish.

---

## 15. OUTPUT FORMAT

Generate the repo as real files and folders.
Populate the important files with working starter content.
Where something cannot be fully implemented in one pass, leave a clean stub with clear comments.

Also provide:
- a final README
- a local run guide
- next-step notes at the end of the README

Do not ask unnecessary questions.
Make grounded implementation decisions and proceed.
