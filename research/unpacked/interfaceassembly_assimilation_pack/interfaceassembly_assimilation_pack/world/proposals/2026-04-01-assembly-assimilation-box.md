# Proposal: Add AssemblyAssimilationBox

## Summary

Add a first-class sovereign box named `AssemblyAssimilationBox` to the Interface Assembly world.

Its role is to intake external repositories, local folders, service surfaces, and model stacks, then translate them into Interface Assembly language.

## Why

The current repo already classifies new components, features, and external repos through WorldBuilder and BlockBuilder, but it does not yet provide a dedicated, reusable assimilation system for repo-to-assembly translation. The new box fills that gap.

## Scope

The box may:

- detect runtime, stack, storage, service, and UI surfaces
- identify workflow primitives
- classify an input as `CoreBlock`, `Adapter`, `SharedInterface`, `ToolSurface`, `MeshNode`, `Sidecar`, or `ReferenceOnly`
- emit a normalized box map
- emit runtime and environment contracts
- emit interface URLs and mesh role suggestions
- emit a risk register

The box may not:

- silently mutate an adopted external repo
- declare canonical truth for other sovereign boxes
- bypass WorldBuilder, Arbiter, Archivist, or InterfaceRegistry

## Initial Exclusion

This proposal adds the assimilation capability itself, but does **not** bundle any external repo as part of the core skill. External repos such as MiroFish remain adapter candidates to be processed later through the assimilation flow.

## Ownership

Suggested owner: `AssemblyAssimilationBox`

## Dependencies

- `WorldBuilderBox` for final classification authority
- `InterfaceRegistryBox` for shared contract registration
- `ArchivistBox` for accepted structural state
- `ArbiterBox` for contradictions and boundary conflicts
- `BlockBuilderBox` for scoped downstream implementation work

## Acceptance criteria

- clause added
- skill cards added for Claude and Codex surfaces
- neutral shared assimilation interface added
- assimilation registry added
- hub card added
- starter amendment recorded
