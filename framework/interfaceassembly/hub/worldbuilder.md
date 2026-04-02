# WorldBuilder

**What it is:** The top-level box that decides what new work is, where it belongs, and which rules govern it before implementation spreads through the repo.

## What it does

- classifies proposed work as a box, interface, adapter, sidecar, or reference
- decides whether a new feature deserves a sovereign block or belongs inside an existing one
- assigns Block Builder scope for each approved block
- oversees Archivist, Arbiter, Interface Registry, and Public Readiness outcomes
- keeps the world coherent as the number of boxes grows

## How to use it

Use the WorldBuilder at the start of new work or when a current boundary becomes unclear.

Typical questions:

- Is this a new box or just more implementation inside an old one?
- Does this imported GitHub repo become an adapter or a sovereign block?
- Which shared contract should the blocks depend on?
- Is the assembly ready to be handed to the public?

## What the WorldBuilder produces

- classification decisions in `agents/worldbuilder/decisions/`
- instructions for Block Builder scope
- recommendations for new clauses, interfaces, or adapters
- release direction after Public Readiness review

## Relationship to the other boxes

- The WorldBuilder decides roles.
- The Block Builder implements inside the approved role.
- The Arbiter resolves disputes when roles or boundaries collide.
- The Archivist records the accepted state.
- The Public Readiness box decides whether the result can leave the workshop.

This keeps execution, governance, and release concerns separated.

## Connects to

- [block-builder.md](block-builder.md) - assigns scoped block work
- [archivist.md](archivist.md) - ensures accepted changes are recorded
- [arbiter.md](arbiter.md) - resolves disputed boundary changes
- [interface-registry.md](interface-registry.md) - keeps shared contracts neutral
- [public-readiness.md](public-readiness.md) - validates public release state

## Limits

- The WorldBuilder should not implement block internals directly
- It decides role and direction, not detailed execution
- It can expand the world, but every expansion must still be recorded by the Archivist

Clause: [world/clauses/WorldBuilderBox.md](../world/clauses/WorldBuilderBox.md)
Agent spec: [agents/worldbuilder/README.md](../agents/worldbuilder/README.md)
