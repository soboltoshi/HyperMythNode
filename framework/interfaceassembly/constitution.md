# Constitution

The rules of Interface Assembly, clause coding, shared interfaces, adapters, amendments, merkle tracking, and public release.

---

## Part I - Clause Rules

### 1. Name the world first

Before any clause exists, the world has a name and a one-sentence purpose.

### 2. One clause, one purpose

A clause defines exactly one box. If the IS line contains two jobs, split it.

### 3. OWNS is exclusive

What a box OWNS, only that box controls. Another box may only interact through a named interface.

### 4. MAY NOT is required

Every clause must include at least one MAY NOT. Constraints are what keep the world legible.

### 5. CONNECTS TO describes interfaces, not implementations

A clause names who it talks to and what flows across the boundary. It does not describe internal code or transport details.

### 6. Boxes do not reach inside other boxes

A box may request. A box may consume a defined contract. A box may never directly mutate another box's internal state.

### 7. The world grows by adding boxes, not by inflating boxes

When a new capability appears, first ask whether it deserves its own box.

### 8. New work must be classified before it is built

Every new component, GitHub repo, feature, or tool must be classified as one of:

- sovereign box
- shared interface
- adapter
- sidecar
- reference only
- out of scope

WorldBuilder owns the final classification.

---

## Part II - Shared Interface Rules

### 9. Shared contracts live outside box clauses

If more than one box depends on the same contract, the contract belongs in `world/interfaces/`, not repeated prose inside multiple clauses.

### 10. Shared interfaces are neutral

A shared interface cannot secretly belong to the consuming box. It must describe the contract in a way that preserves both sides' sovereignty.

### 11. Promotion to shared interface is deliberate

A local connection is promoted to a shared interface when at least one of these is true:

- three or more boxes depend on the same contract
- two boxes are copying the same interface language
- a cross-box dispute keeps recurring around the same connection
- the interface needs versioning independent of either box

### 12. Shared interfaces do not own business state

An interface may define messages, required fields, invariants, and versions. It does not become the owner of the underlying state.

---

## Part III - Adapter Rules

### 13. Adapters are edges, not sovereign owners

An adapter translates between the world and an external repo, tool, service, or runtime surface. It never becomes the canonical owner of world state.

### 14. External repos must enter through adapter records

Any new GitHub repo or vendored tool must receive an adapter record in `world/adapters/` before it is treated as part of the world.

### 15. Adapters must declare ownership boundaries

Every adapter record must name:

- upstream source
- owning box
- exposed interface
- mutable surfaces
- forbidden surfaces
- install status

### 16. Replaceability is required

If removing an adapter destroys the core world definition, the adapter is not an adapter and must be reclassified.

---

## Part IV - Block Agent Rules

### 17. One block agent, one block

Each BlockBuilder instance is scoped to exactly one accepted box, interface, or adapter target.

### 18. A block agent defines role before implementation

Before a block agent builds anything, it must define the role, owned surfaces, incoming interfaces, outgoing interfaces, and dependencies for its target.

### 19. Cross-block changes require both sides

If Block A needs Block B changed, the owning block agent for B must be involved. The requesting block agent cannot redefine B alone.

### 20. Block agents propose across boundaries

Cross-boundary changes travel as proposals. They are not direct edits.

### 21. Arbiter resolves contradictions, WorldBuilder ratifies boundaries

Arbiter resolves disputes. WorldBuilder decides final role and boundary shape. Archivist records accepted truth.

---

## Part V - Amendment Rules

### 22. Every accepted clause change produces an amendment

No silent structural change exists in this system.

### 23. Amendments may target a box, interface, adapter, or registry

The Archivist records accepted structural changes in `world/amendments/`, even when the target is not a sovereign box clause.

### 24. Amendments are sequential and immutable

Each amendment receives a global sequence number. Once filed, it is not rewritten.

### 25. Rejected proposals still belong in the record

Rejected or deferred structural decisions must remain visible in proposals, conflict logs, or decision reports.

---

## Part VI - Merkle Rules

### 26. Every clause has a signature

Format:

`<BoxName>-v<N>-<YYYYMMDD>`

### 27. Every clause contributes a short merkle token

The token is the box stem initials plus version number.

Examples:

- `ArbiterBox` -> `A1`
- `ArchivistBox` -> `A1`
- `BlockBuilderBox` -> `BB1`
- `HermesAgentBox` -> `HA1`
- `WorldBuilderBox` -> `WB1`

### 28. The merkle root is the ordered token chain

List clause tokens alphabetically by clause name, concatenate them, and prefix with `ia-root-`.

This root is intentionally human-computable and human-readable.

### 29. Merkle state lives in `world/merkle/current.md`

After every accepted structural change, Archivist updates the current merkle file.

### 30. The latest gistbook snapshot must include the current root

The gistbook is tied to the exact world state through the merkle root.

---

## Part VII - Agent Rules

### 31. Archivist owns the structural record

Archivist files amendments, updates signatures, and maintains merkle state.

### 32. Arbiter owns conflict resolution

Arbiter investigates contradictions and proposes the minimum coherent change.

### 33. WorldBuilder owns classification and final boundary shape

WorldBuilder decides whether new work becomes a box, interface, adapter, sidecar, or reference.

### 34. BlockBuilder owns scoped assembly work

BlockBuilder creates a local role definition and reports on one target at a time.

### 35. PublicReadiness owns the release gate

PublicReadiness decides whether the repo is ready to be used publicly as an agent skill or agent hub.

### 36. Hermes and G0DM0D3 are tools, not constitutional authorities

They support the named agents. They do not own world state or ratify structure.

### 37. Every acting agent reads the world first

No agent has standing if it has not read the world, active clauses, relevant interfaces, and the current merkle state.

---

## Part VIII - Public Release Rules

### 38. Public release is a governed event

Publishing the hub or skill pack is a formal world event. It must pass through PublicReadiness.

### 39. A public hub must be legible without hidden code assumptions

A public reader must be able to understand the world, the roles, the interfaces, and the install path from the markdown layer alone.

### 40. Public release must state what is local and what is vendored

The hub must clearly separate native boxes, shared interfaces, adapters, and vendored external tools.

---

## Part IX - Clause Format

```markdown
---
clause: BoxName
version: N
signature: BoxName-vN-YYYYMMDD
created: YYYY-MM-DD
last_amended: YYYY-MM-DD
amendment_ref: BoxName-A<N> | none
---

# BoxName

**IS:** One sentence.

**OWNS:**
- field_one
- field_two

**MAY:**
- allowed action

**MAY NOT:**
- forbidden action

**CONNECTS TO:**
- OtherBox - what flows between them
```

---

## Part X - Structural Record Format

Saved to `world/amendments/A<NNN>-<Target>-<slug>.md`

```markdown
---
amendment: NNN
target: BoxName | InterfaceName | AdapterName | RegistryName
target_type: box | interface | adapter | registry
ref: Target-A<NNN>
type: add | modify | remove
date: YYYY-MM-DD
proposed_by: human | archivist | arbiter | blockbuilder | worldbuilder | public-readiness
status: accepted | rejected | deferred
previous_signature: <signature> | none
new_signature: <signature> | none
previous_merkle_root: ia-root-...
new_merkle_root: ia-root-...
---
```

---

## The Single Test

If a new builder can read the world, understand who owns what, add a new block without copying hidden structure, and trace every accepted boundary decision afterward, the method is working.
