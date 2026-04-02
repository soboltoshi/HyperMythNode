# HyperMyths Assembly

## Classification

Every module must be classified as one of:

- box
- interface
- adapter
- client
- worker
- rail
- vault
- index

## Ownership rules

- Session state belongs to SessionKernel.
- World creation belongs to WorldSpawn.
- Discovery belongs to WorldDirectory.
- Finance routing belongs to MYTHIV.
- Media job orchestration belongs to HashMedia.
- Agent tasking belongs to AgentMesh.
- Useful work routing belongs to CancerHawk.
- Derived values belong in indexes, not boxes.
- Adapters are edges, not truth owners.

## Merge rule

When changing multiple boxes, keep protocol contracts neutral and route coordination through shared packages rather than circular imports.
