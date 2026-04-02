# Gistbook

The gistbook is the continuity layer for the world.

Clauses define structure. Registries define placement. Interfaces define contracts. Adapters define external edges. The gistbook says what the whole assembly currently is.

---

## Why It Exists

Code tells you what was implemented.

The gistbook tells you:

- what the world currently contains
- which boxes are sovereign
- which contracts are shared
- which adapters are active
- what changed recently
- what still needs a decision

If the code is deleted, the gistbook should still let another agent rebuild the world shape.

---

## Snapshot Format

A gistbook snapshot is a markdown file saved to `world/gistbook/`.

Filename:

`YYYY-MM-DD-<brief-slug>.md`

```markdown
---
gistbook: true
world: <WorldName>
snapshot: YYYY-MM-DDThh:mm:ssZ
version: <incrementing integer>
merkle_root: ia-root-...
---

# Gistbook - <WorldName> - <date>

## The World
One paragraph describing the world.

## Sovereign Boxes
- **BoxName** (v1) - owned state and role

## Shared Interfaces
- **InterfaceName** (v1) - which boxes consume it

## Adapters
- **AdapterName** - upstream repo or external tool and owning box

## What Changed
Recent accepted structural changes.

## Open Decisions
Pending proposals, conflicts, or release blockers.

## What Is Next
The next box, interface, or adapter that should exist.
```

---

## Rules

- One snapshot per meaningful structural shift.
- The latest snapshot is the current human-readable truth.
- Never delete older snapshots.
- The snapshot must make sense to a new reader without reading code.
- The snapshot must include the current merkle root.

---

## Relationship To Amendments

Amendments record accepted structural changes one by one.

The gistbook records the resulting whole world at a point in time.
