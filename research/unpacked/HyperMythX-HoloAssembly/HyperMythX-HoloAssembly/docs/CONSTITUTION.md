# HyperMythX Constitution

## Core roles
### Rust kernel
Owns:
- world truth
- session phases
- timers
- leases and locks
- chess truth
- receipts
- replay protection
- validation

### Unity runtime
Owns:
- rendering
- VR/desktop input
- preview ghosts
- motion interpolation
- audio and FX
- UI and terminal embodiment

### xLua shell
Owns:
- build commands
- world scripting
- agent task glue
- shell macros
- session-state scripting
- media job requests

## Authority rule
Lua may request.
Unity may preview.
Rust must approve.

## World limits
- world_x = 42
- world_y = 42
- world_z = 42
- active_agents_max = 16

## Initial world rooms
1. Spawn room
2. Chess chamber
3. Creator terminal room
4. Market / beacon room

## Hard safety rules
- No direct world mutation from voice input
- No direct truth mutation from Unity UI
- No silent background scripts changing ownership without a Rust command
- All receipts must be logged
