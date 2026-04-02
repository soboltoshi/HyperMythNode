# Assembly Assimilation Skill

Purpose: convert an external repo, local folder, service, or model stack into Interface Assembly language.

## Procedure

- inspect source
- identify runtime and entrypoints
- identify services, storage, UI surfaces, and worker loops
- extract workflow primitives
- classify source kind
- emit normalized adoption material

## Allowed classifications

- CoreBlock
- Adapter
- SharedInterface
- ToolSurface
- MeshNode
- Sidecar
- ReferenceOnly

## Required sections

- ASSIMILATION_REPORT
- BOX_MAP
- RUNTIME_CONTRACT
- ENVIRONMENT_CONTRACT
- MESH_ROLE
- RISK_REGISTER
- INTERFACE_URL_SET
- ADOPTION_RECOMMENDATION

## Guardrails

- never mutate core world truth directly
- never skip WorldBuilder classification
- never skip Archivist for accepted structural state
- explicitly state unknowns and coupling risks
