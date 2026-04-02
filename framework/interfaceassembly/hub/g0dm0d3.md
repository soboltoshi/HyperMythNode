# G0DM0D3

**What it is:** A vendored evaluator adapter used when the assembly world needs competing model judgments.

## What it does

- compares multiple model outputs for the same prompt
- helps `Arbiter` and `WorldBuilder` evaluate ambiguous structural questions
- stays external to sovereign ownership; it advises, but it does not govern

## How to use it in this repo

- treat it as an adapter described by `world/adapters/G0DM0D3Adapter.md`
- keep its upstream code under `agents/vendor/g0dm0d3-upstream/`
- route evaluation questions through the owning box instead of copying its internals into local clauses

## Connects to

- [arbiter.md](arbiter.md)
- [worldbuilder.md](worldbuilder.md)
- [interface-assembly.md](interface-assembly.md)

## Limits

- it is an external edge, not a shared contract owner
- it may inform a decision, but `WorldBuilder` and `Arbiter` remain authoritative
- local assembly rules should not be rewritten just to mirror upstream implementation details

## Where it lives

`agents/vendor/g0dm0d3-upstream/`

Clause: [world/clauses/G0DM0D3Box.md](../world/clauses/G0DM0D3Box.md)
