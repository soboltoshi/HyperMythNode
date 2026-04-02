---
merkle_root: ia-root-A1A1BB1G1HA1IR1PR1WB1
computed_at: 2026-03-30
last_amendment: none
clause_count: 8
---

# Merkle State - Interface Assembly

Current root fingerprint of all sovereign box clauses in this starter world.

---

## Current Root

```text
ia-root-A1A1BB1G1HA1IR1PR1WB1
```

This root is derived from the ordered merkle tokens listed below.

---

## Clause Signatures

| Clause | Signature | Token | Version | Last Amended |
|--------|-----------|-------|---------|--------------|
| ArbiterBox | ArbiterBox-v1-20260330 | A1 | 1 | 2026-03-30 |
| ArchivistBox | ArchivistBox-v1-20260330 | A1 | 1 | 2026-03-30 |
| BlockBuilderBox | BlockBuilderBox-v1-20260330 | BB1 | 1 | 2026-03-30 |
| G0DM0D3Box | G0DM0D3Box-v1-20260330 | G1 | 1 | 2026-03-30 |
| HermesAgentBox | HermesAgentBox-v1-20260330 | HA1 | 1 | 2026-03-30 |
| InterfaceRegistryBox | InterfaceRegistryBox-v1-20260330 | IR1 | 1 | 2026-03-30 |
| PublicReadinessBox | PublicReadinessBox-v1-20260330 | PR1 | 1 | 2026-03-30 |
| WorldBuilderBox | WorldBuilderBox-v1-20260330 | WB1 | 1 | 2026-03-30 |

---

## How To Verify

1. Read each clause file in `world/clauses/`.
2. List the clause tokens alphabetically by clause name.
3. Concatenate the tokens in order.
4. Prefix with `ia-root-`.

If the result matches `ia-root-A1A1BB1G1HA1IR1PR1WB1`, the starter world is consistent.

---

## Notes

This file records the current starter root only.

Project-specific merkle history begins when your own world starts filing accepted structural changes.
