# Archivist

**What it is:** The custody agent for clauses, interfaces, adapters, registries, and the current merkle state.

## What it does

- records accepted changes as amendments
- updates clause signatures and registry entries
- keeps `world/merkle/current.md` coherent with the current box set
- logs what was added as a sovereign box, shared interface, adapter, or release decision

## How to use it

Run `/amend <target>` after `WorldBuilder` or `Arbiter` has accepted a structural change.

The Archivist should:
1. read the accepted proposal or conflict decision
2. update the relevant clause, interface, adapter, or registry
3. file the amendment record under `world/amendments/`
4. refresh the merkle state and gistbook references if needed

## What it owns

- amendment files in `world/amendments/`
- merkle state in `world/merkle/current.md`
- structural bookkeeping in `world/registries/`

## Connects to

- [arbiter.md](arbiter.md) for accepted cross-box decisions
- [worldbuilder.md](worldbuilder.md) for classification and authority
- [interface-registry.md](interface-registry.md) for shared contract visibility
- [public-readiness.md](public-readiness.md) for release records

## Limits

- the Archivist does not classify new work
- the Archivist does not resolve conflicts
- the Archivist records accepted structure; it does not invent it

Clause: [world/clauses/ArchivistBox.md](../world/clauses/ArchivistBox.md)
Agent spec: [agents/archivist/README.md](../agents/archivist/README.md)
