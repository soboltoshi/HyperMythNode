# JarWiz Security

JarWiz Security is the policy and validation layer that sits in front of SIMD69 ordering.

## Goals

- validate shell and agent intents before they touch canonical state
- separate **operator** powers from world mutation powers
- enforce cooldowns, deny-lists, and budget caps
- require receipts for accepted actions
- keep the natural-language shell proposal-only

## Core rules

1. **JarViz** may parse natural language into structured commands, but cannot commit canonical world state directly.
2. All commands must pass schema validation.
3. Security policy runs before scoring and before planning.
4. Unsafe commands are rejected with explicit reasons.
5. Operator-like actions may manage members or sessions but may not bypass kernel verification.

## Suggested policy domains

- command schema validation
- actor allowlist / denylist
- role-based permissions
- cooldown enforcement
- compute budget caps
- dangerous action flags
- receipt requirement for accepted mutations

## Naming

- **JarViz** = shell agent
- **JarViz VR** = in-world VR agent persona
