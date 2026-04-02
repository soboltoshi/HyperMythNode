# Interface Assembly

A markdown-first starter repo for building software as named boxes, shared interfaces, replaceable adapters, and tracked decisions.

No framework is required. No language is required. The world lives in files that humans and agents can both read.

---

## What This Repo Is

Interface Assembly is a governance shell for software that should stay legible as it grows.

The working rule is simple:

1. Propose the thing.
2. Decide whether it is a box, a shared interface, or an adapter.
3. Give it one owner.
4. Let its scoped agent work only inside that boundary.
5. Route cross-boundary changes through Arbiter, Archivist, and WorldBuilder.
6. Run a public-readiness pass before you publish your own version of the hub.

The method keeps three boundaries clear:

- core owners stay separate from adapters
- shared contracts stay neutral
- agents propose across boundaries instead of mutating them directly

---

## The Boxes

The starter world includes eight first-class boxes:

- `ArchivistBox`: records accepted structural truth and merkle state
- `ArbiterBox`: resolves cross-box conflicts and boundary contradictions
- `WorldBuilderBox`: decides whether a proposal becomes a box, interface, or adapter
- `BlockBuilderBox`: scopes one builder agent per new component, repo, or feature
- `InterfaceRegistryBox`: owns shared contracts and reuse rules
- `PublicReadinessBox`: verifies the hub is publishable for public use
- `G0DM0D3Box`: multi-model evaluator used during arbitration and review
- `HermesAgentBox`: long-term memory and delegation surface used by the system agents

Each box has a clause in [`world/clauses/`](world/clauses/).

---

## The Lifecycle

Every new component, external repo, or feature moves through the same assembly path:

1. `Proposal`
   - Write an intake record in [`world/proposals/`](world/proposals/).
   - Say what is being added and why.

2. `Classification`
   - WorldBuilder decides whether it is:
   - a new sovereign box
   - a shared interface
   - an adapter to an external repo or tool
   - a sidecar or reference that should stay outside the world

3. `Scoped Build`
   - BlockBuilder creates one scoped block agent for the accepted box.
   - That block agent defines local role, dependencies, interfaces, and reports.

4. `Shared Contract`
   - If more than one box depends on the same contract, the contract moves into [`world/interfaces/`](world/interfaces/).

5. `Cross-Block Change`
   - If Box A needs Box B changed, Box A does not change Box B directly.
   - Box A writes a request through a shared interface contract.
   - Box B's owner agent participates.
   - Arbiter resolves contradictions.
   - WorldBuilder ratifies the final boundary.
   - Archivist records the accepted state.

6. `Archive`
   - Accepted structural changes land in [`world/amendments/`](world/amendments/).

7. `Public Readiness`
   - PublicReadinessBox checks clarity, onboarding, registry integrity, and skill-packaging readiness.

---

## Repository Structure

```text
README.md
constitution.md
GISTBOOK.md
THIRD_PARTY_NOTICES.md
third_party_licenses/

hub/
  README.md
  *.md                         <- public skill cards

world/
  WORLD.md                     <- current world map
  clauses/                     <- one clause per sovereign box
  amendments/                  <- accepted clause changes when your project starts making them
  proposals/                   <- intake records before adoption
  interfaces/                  <- neutral shared contracts
  adapters/                    <- external repo/tool adapter records
  registries/                  <- block, interface, adapter, and agent registries
  ledgers/                     <- reporting and notification rules
  gistbook/                    <- snapshots of current truth
  merkle/current.md            <- current merkle tokens and root

agents/
  archivist/
  arbiter/
  blockbuilder/
  public-readiness/
  worldbuilder/
  vendor/

.claude/
  CLAUDE.md
  skills/
```

---

## Slash Skills

These repo-local skills are the operator surface:

- `/clause <Name>`: define or revise a sovereign box after checking proposals and boundaries
- `/build <request>`: build inside an existing box or route the work to BlockBuilder if the request creates a new block
- `/block-builder <request>`: intake and scope a new component, repo, or feature as a box, interface, or adapter
- `/amend <Target>`: file accepted structural changes through Archivist
- `/conflict <description>`: log a contradiction for Arbiter resolution
- `/oversee`: run the WorldBuilder coherence review
- `/public-readiness`: run the release gate for publishing your own version of this repo as a hub or skill pack
- `/gistbook`: snapshot the current world
- `/hub <question>`: search the human-readable skill cards

---

## How To Start

1. Open [`world/WORLD.md`](world/WORLD.md) and read the starter world.
2. Replace the example world language if your project needs a different framing.
3. Write your first real proposal in [`world/proposals/`](world/proposals/).
4. Run `/block-builder <request>` for any new feature, new component, or external repo.
5. Let WorldBuilder classify it as a box, interface, or adapter.
6. Build only inside the accepted boundary.
7. Route structural changes through `/amend` or `/conflict`.
8. Run `/public-readiness` before publishing your own version of the hub.

---

## Design Rules

- One owner per box.
- Shared contracts live outside box internals.
- Adapters are edges, not state owners.
- Cross-box changes require both the requesting block and the owning block.
- Archivist records accepted truth.
- WorldBuilder decides system shape.
- Public release is a governed step, not an afterthought.

---

## Public Use

This repo is intended to be copied, trimmed, or extended into your own assembly world.

If you want the minimal public flow:

1. keep the markdown governance layer
2. replace the example world with your own
3. keep the slash-skill files under `.claude/skills/`
4. keep external tools behind adapter records instead of mixing them into core boxes
5. review [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and the per-package markdown files in `third_party_licenses/` before redistributing vendored adapters

---

## License

AGPL-3.0-or-later for the root starter distribution.

Vendored upstream packages keep their own notices and license files. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the markdown files in `third_party_licenses/`.
