# Clause Coding

**What it is:** A simple way to define a box - what it is, what it owns, what it may and may not do, and how it connects to other boxes.

---

## What it does

- Gives every piece of your system a name and a job
- Makes ownership explicit so nothing accidentally grows too large
- Creates clear interfaces so boxes can talk without reaching inside each other
- Produces a plain markdown file that both humans and agents can read

---

## How to write a clause

Run `/clause <BoxName>` and the agent walks you through it.

Or write it yourself. Here is the format:

```markdown
---
clause: BoxName
version: 1
signature: BoxName-v1-YYYYMMDD
created: YYYY-MM-DD
last_amended: YYYY-MM-DD
amendment_ref: none
---

# BoxName

**IS:** One sentence. What is this box for?

**OWNS:**
- field_one
- field_two

**MAY:**
- List what this box is allowed to do

**MAY NOT:**
- List at least one thing this box must never do

**CONNECTS TO:**
- OtherBox - what flows between them
```

Save it as `world/clauses/BoxName.md`.

---

## The five parts explained

**IS** - One sentence. No "and also". If you find yourself writing "and also", you have two boxes, not one.

**OWNS** - The exact fields this box controls. No other box may read or write these directly.

**MAY** - What this box is allowed to do.

**MAY NOT** - At least one item required. This is what keeps the box from swallowing the world.

**CONNECTS TO** - Which boxes talk to this one, and what flows between them. Not how. Just what.

---

## Example

```markdown
---
clause: ProfileBox
version: 1
signature: ProfileBox-v1-YYYYMMDD
created: YYYY-MM-DD
last_amended: YYYY-MM-DD
amendment_ref: none
---

# ProfileBox

**IS:** The box that owns a user's identity - name, avatar, and settings.

**OWNS:**
- user_id
- display_name
- avatar_url
- settings

**MAY:**
- Create a new profile when a user signs up
- Update display_name and avatar_url when the user requests it

**MAY NOT:**
- Store passwords or authentication tokens
- Read or write any other box's state directly

**CONNECTS TO:**
- AuthBox - receives user_id after a successful login
- NoteBox - provides display_name when a note is displayed
```

---

## Rules to remember

1. One clause = one purpose.
2. `MAY NOT` is not optional.
3. `OWNS` is exclusive.
4. `CONNECTS TO` names real boxes or real shared contracts.

---

## Connects to

- [interface-assembly.md](interface-assembly.md) - the bigger picture
- [gistbook.md](gistbook.md) - saving a snapshot after you define a clause
