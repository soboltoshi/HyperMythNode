# Merkle State

**What it is:** A verifiable fingerprint of the entire world at any point in time. If the merkle root changes, something in the clause set changed.

---

## Why it exists

In a system where clauses evolve over time, you need a way to know instantly whether two copies of the world are identical. The merkle state gives you that: a single short string (the root) that changes whenever any clause changes.

This is the same principle as a git commit hash or a blockchain block hash — a fingerprint that covers the whole tree.

---

## How it works

### Step 1: Each clause has a signature

Every clause file has a `signature` field in its frontmatter:

```
ProfileBox-v3-20260330
NoteBox-v1-20260301
SearchBox-v2-20260315
```

The signature is: `<BoxName>-v<version>-<YYYYMMDD>`

It changes every time the clause is amended.

### Step 2: The signatures are listed alphabetically

```
ArbiterBox-v1-20260330
ArchivistBox-v1-20260330
G0DM0D3Box-v1-20260330
HermesAgentBox-v1-20260330
WorldBuilderBox-v1-20260330
```

### Step 3: The root fingerprint is derived

Concatenate all signatures in alphabetical order. Take the first 12 characters of the result as the root.

Example:
```
ArbiterBox-v1-20260330ArchivistBox-v1-20260330G0DM0D3Box-v1-20260330...
                                               ↓
                                      ia-root-417a8c3f2e91
```

The prefix `ia-root-` marks it as an Interface Assembly root.

### Step 4: The root is stored in world/merkle/current.md

---

## Reading the merkle state

Open `world/merkle/current.md`. It shows:

- The current root
- The list of all clause signatures that produced it
- The last amendment that changed it

---

## Verifying the merkle state

Run `/oversee`. The WorldBuilder recomputes the root from current clause files and compares it to `world/merkle/current.md`.

If they match: the world is consistent.
If they differ: a clause was changed without an amendment being filed.

---

## The merkle tree structure

The merkle tree is conceptually structured like this:

```
           ia-root-417a8c
               /        \
      ia-mid-a3f1      ia-mid-c7e9
         /    \            /    \
   Arbiter  Archivist  G0DM0D3  Hermes
   -v1-...   -v1-...   -v1-...  -v1-...
```

In practice (for readability), we flatten it to a single concatenated fingerprint. A full binary tree implementation can be added later if precision is required.

---

## Merkle root in gistbook snapshots

Every gistbook snapshot includes the merkle root at the time of writing. This ties the snapshot to the exact world state it describes.

---

## Connects to

- [archivist.md](archivist.md) — the Archivist updates the merkle state after every amendment
- [worldbuilder.md](worldbuilder.md) — the WorldBuilder verifies the merkle root during `/oversee`
- [amendments.md](amendments.md) — every amendment produces a new root

---

## Current state

Live at: [world/merkle/current.md](../world/merkle/current.md)
