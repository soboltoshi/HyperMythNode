# Arbiter

**What it is:** The boundary judge for cross-box changes, contradictory ownership, and shared contract disputes.

## What it does

- reviews conflicts between sovereign boxes
- ensures the original block owner is involved when another block needs a change
- distinguishes a local implementation choice from a shared interface problem
- proposes the minimum coherent resolution and hands accepted outcomes to the Archivist

## When to use it

Run `/conflict <short description>` when:

- two boxes claim the same owned field
- one block wants another block to change its local contract
- a shared interface no longer matches the blocks depending on it
- an adapter is acting like a hidden state owner

## What the Arbiter produces

- a conflict record in `agents/arbiter/conflicts/`
- a recommended resolution path
- a clear note on whether the fix belongs in a clause, interface, adapter, or proposal

## Connects to

- [worldbuilder.md](worldbuilder.md) for final structural authority
- [archivist.md](archivist.md) for accepted amendment filing
- [interface-registry.md](interface-registry.md) when a local connection must become shared
- [g0dm0d3.md](g0dm0d3.md) when competing interpretations need outside evaluation

## Limits

- the Arbiter does not silently edit both sides
- the Arbiter does not create final law without `WorldBuilder`
- unresolved conflicts stay open until ownership and governance are explicit

Clause: [world/clauses/ArbiterBox.md](../world/clauses/ArbiterBox.md)
Agent spec: [agents/arbiter/README.md](../agents/arbiter/README.md)
