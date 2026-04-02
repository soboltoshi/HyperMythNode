# Build Doctrine

## Build top-down
Start with the truth engine, then expose it to web and Unity, then attach the creator shell.

## First milestone
- Rust server runs
- snapshot endpoint works
- command endpoint works
- web app shows snapshot and experiments
- Unity can fetch snapshot
- shell command can create one experiment record

## Tools
- VS Code
- Rust + Cargo
- Node.js + npm
- Unity Hub + Unity Editor
- OpenXR packages in Unity later

## Gotchas
- Do not let Unity become the authority.
- Do not let the scripting layer directly mutate truth.
- Do not use one GameObject per voxel.
- Keep the world bounded and agent count capped.
