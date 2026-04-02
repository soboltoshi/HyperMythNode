# Amendments

**What it is:** The system for tracking accepted structural changes - numbered, chained, and visible.

---

## Why amendments exist

Code changes silently. World structure should not.

Every time a box, shared interface, adapter, or registry is structurally changed, there should be a record saying what changed, why it changed, and what the accepted state became.

---

## How amendments work

1. You propose a structural change via `/amend <Target>`
2. The Archivist reads the accepted decision
3. The Archivist writes an amendment file to `world/amendments/`
4. The relevant clause, interface, adapter, or registry is updated
5. The merkle state is refreshed if sovereign box state changed

---

## Amendment numbering

Amendments are numbered globally across the project:

```text
A001 - first accepted amendment in your project
A002 - second accepted amendment in your project
...
```

Each target can also have its own local reference:

```text
ProfileBox-A1 -> ProfileBox-A2 -> ProfileBox-A3
```

---

## Amendment file names

```text
world/amendments/A<NNN>-<Target>-<short-description>.md
```

Examples:

```text
A001-ProfileBox-add-avatar-field.md
A002-SearchContract-add-tag-filter.md
A003-NotesAdapter-change-upstream-path.md
```

---

## Amendment file format

```markdown
---
amendment: 001
target: ProfileBox
target_type: box
ref: ProfileBox-A1
type: modify
date: YYYY-MM-DD
proposed_by: human
status: accepted
previous_signature: ProfileBox-v1-YYYYMMDD
new_signature: ProfileBox-v2-YYYYMMDD
previous_merkle_root: ia-root-...
new_merkle_root: ia-root-...
---

# Amendment 001 - ProfileBox - add avatar field

## What changed
Added `avatar_url` to OWNS.

## Why
Profile identity needed an explicit image field.
```

---

## Connects to

- [archivist.md](archivist.md) - the Archivist writes all amendments
- [merkle.md](merkle.md) - accepted sovereign changes update the merkle root
- [clause-coding.md](clause-coding.md) - clause format that amendments modify
