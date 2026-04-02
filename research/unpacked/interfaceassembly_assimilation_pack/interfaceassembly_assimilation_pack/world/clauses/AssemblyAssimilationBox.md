# Clause: AssemblyAssimilationBox

## Name

`AssemblyAssimilationBox`

## Purpose

AssemblyAssimilationBox translates external systems into Interface Assembly language.

It does not decide world truth on its own. It prepares structured adoption material so the existing world boxes can classify, review, ratify, and archive additions cleanly.

## Responsibilities

AssemblyAssimilationBox may:

1. intake a GitHub repository, local folder, service API, or model stack
2. detect runtime, stack, services, storage, interfaces, and user surfaces
3. extract workflow primitives and local roles
4. classify the target candidate as one of:
   - `CoreBlock`
   - `Adapter`
   - `SharedInterface`
   - `ToolSurface`
   - `MeshNode`
   - `Sidecar`
   - `ReferenceOnly`
5. emit:
   - an assimilation report
   - a box map
   - a runtime contract
   - an environment contract
   - a mesh role suggestion
   - a risk register
   - canonical Interface URLs
6. recommend one of:
   - wrap as adapter
   - embed UI only
   - reuse backend only
   - rewrite selected primitives
   - leave outside the world

## Non-authorities

AssemblyAssimilationBox may not:

- unilaterally create sovereign boxes
- unilaterally promote shared contracts into the registry
- overwrite another box's clause
- declare a repo adopted without WorldBuilder ratification
- record accepted structural truth without Archivist

## Inputs

Accepted intake forms:

- GitHub repository URL
- local folder
- service endpoint description
- model stack description

Optional intake hints:

- desired role
- target world
- target mesh
- preferred deployment mode
- preferred adoption strategy

## Outputs

Required outputs:

- `ASSIMILATION_REPORT`
- `BOX_MAP`
- `RUNTIME_CONTRACT`
- `ENVIRONMENT_CONTRACT`
- `MESH_ROLE`
- `RISK_REGISTER`
- `INTERFACE_URL_SET`
- `ADOPTION_RECOMMENDATION`

## Operating rule

AssemblyAssimilationBox is a translator and normalizer. WorldBuilder remains the classifier of record. Archivist remains the recorder of record.

## Cross-box behavior

- Classification disagreements route to `ArbiterBox`.
- Shared contracts route to `InterfaceRegistryBox`.
- Accepted state routes to `ArchivistBox`.
- Build work routes through `BlockBuilderBox`.

## Success condition

A foreign repo or service becomes legible enough that the world can adopt it without confusing whether it is a box, adapter, interface, sidecar, or reference.
