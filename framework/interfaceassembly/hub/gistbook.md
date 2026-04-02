# Gistbook

**What it is:** The save file for your world. A snapshot that captures what exists, what changed, and what comes next - in plain markdown.

---

## What it does

- Records the current state of your world in one readable file
- Lets a new person or agent understand the project without reading implementation code
- Preserves the reasoning behind structural decisions
- Creates a history of how the world grew - one snapshot per meaningful shift

---

## How to use it

Run `/gistbook` and the agent:

1. Reads all your clause files
2. Reads the previous snapshot if one exists
3. Figures out what changed
4. Writes a new snapshot file to `world/gistbook/`

The file is named `YYYY-MM-DD-brief-slug.md` so you can scan the snapshot history quickly.

---

## How to read a snapshot

Open any file in `world/gistbook/`. It should have these sections:

- **The World** - one paragraph describing what the project is for
- **What Exists** - one line per important box, interface, or adapter
- **What Changed** - what shifted since the last snapshot and why
- **What Connects** - which boxes talk to which, and what flows between them
- **What Is Next** - the next box, interface, or piece of work
- **Notes** - decisions made, paths not taken, constraints discovered

---

## Example snapshot

```markdown
---
gistbook: true
world: NoteKeeper
snapshot: YYYY-MM-DDThh:mm:ssZ
version: 2
merkle_root: ia-root-...
---

# Gistbook - NoteKeeper - YYYY-MM-DD

## The World
NoteKeeper is a simple system where users write notes that are searchable and persistent.

## What Exists
- **ProfileBox** (v1) - owns: user_id, display_name, avatar_url
- **NoteBox** (v1) - owns: note_id, author_id, content, tags
- **SearchBox** (v1) - owns: search index

## What Changed
Added SearchBox after search concerns stopped fitting cleanly inside NoteBox.

## What Connects
- NoteBox -> SearchBox: emits note_created events
- ProfileBox -> NoteBox: provides display_name on note display

## What Is Next
SearchBox needs tag filtering.

## Notes
Search and note storage remain separate because they own different concerns.
```

---

## Rules

- Never delete old snapshots once your project starts using them
- The latest snapshot is the latest human-readable world state
- A snapshot should stand alone for a new reader
- If nothing structural changed since the last snapshot, skip it

---

## Connects to

- [interface-assembly.md](interface-assembly.md) - the bigger picture
- [clause-coding.md](clause-coding.md) - writing the clause files that gistbook reads
