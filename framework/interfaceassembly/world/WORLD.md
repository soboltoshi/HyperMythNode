# World: Interface Assembly

A markdown-first starter world where software can be proposed, classified, scoped, arbitrated, archived, and prepared for public release.

---

## Boxes

| Box | Purpose | Signature |
|-----|---------|-----------|
| [ArchivistBox](clauses/ArchivistBox.md) | Records accepted structure and merkle state | ArchivistBox-v1-20260330 |
| [ArbiterBox](clauses/ArbiterBox.md) | Resolves conflicts between boxes, interfaces, and adapters | ArbiterBox-v1-20260330 |
| [BlockBuilderBox](clauses/BlockBuilderBox.md) | Scopes one block agent per new component, repo, or feature | BlockBuilderBox-v1-20260330 |
| [G0DM0D3Box](clauses/G0DM0D3Box.md) | Multi-model AI evaluator | G0DM0D3Box-v1-20260330 |
| [HermesAgentBox](clauses/HermesAgentBox.md) | Self-improving autonomous agent and memory surface | HermesAgentBox-v1-20260330 |
| [InterfaceRegistryBox](clauses/InterfaceRegistryBox.md) | Owns shared contracts and adapter classification rules | InterfaceRegistryBox-v1-20260330 |
| [PublicReadinessBox](clauses/PublicReadinessBox.md) | Runs the final gate before public publication | PublicReadinessBox-v1-20260330 |
| [WorldBuilderBox](clauses/WorldBuilderBox.md) | Classifies new work and ratifies boundary shape | WorldBuilderBox-v1-20260330 |

## Merkle Root

```text
ia-root-A1A1BB1G1HA1IR1PR1WB1
```

Full state: [world/merkle/current.md](merkle/current.md)

---

## Connections

```text
WorldBuilderBox
    |
    |-- classifies --> proposal as box / interface / adapter / sidecar
    |-- ratifies --> final role and boundary shape
    |-- watches --> ArchivistBox
    |-- watches --> ArbiterBox
    `-- watches --> PublicReadinessBox

BlockBuilderBox
    |
    |-- reads --> proposals, clauses, interfaces, adapters
    |-- creates --> one scoped block agent per accepted target
    |-- reports --> ArchivistBox, WorldBuilderBox
    `-- escalates --> ArbiterBox when another box must change

InterfaceRegistryBox
    |
    |-- promotes --> local connection into shared contract when reuse pressure appears
    `-- keeps --> interface and adapter boundaries visible

ArchivistBox
    |
    |-- records --> accepted clause/interface/adapter changes
    `-- updates --> merkle/current.md and registry truth

ArbiterBox
    |
    |-- resolves --> cross-box contradictions
    |-- requires --> owner-box participation on cross-boundary changes
    `-- uses --> G0DM0D3Box

PublicReadinessBox
    |
    |-- checks --> onboarding, packaging, registry integrity, release clarity
    `-- blocks --> public publication until the hub is legible

HermesAgentBox <-- used by ArchivistBox, WorldBuilderBox, BlockBuilderBox for memory and delegation
G0DM0D3Box     <-- used by ArbiterBox and PublicReadinessBox for evaluation
```

---

## Starter State

This repo ships with the base governance layer already in place:

- Eight sovereign box clauses
- Blank proposal, amendment, gistbook, and report folders
- Shared contract and adapter folders
- Registry layer
- BlockBuilder, Archivist, Arbiter, WorldBuilder, and PublicReadiness roles
- A current merkle root for the starter clause set

## What You Do Next

- Replace the example world language with your own project language if needed
- Write your first real proposal in `world/proposals/`
- Bring the next feature or repo in through `/block-builder`
- Record accepted structural changes through `/amend`
- Run `/public-readiness` before publishing your own version of the hub
