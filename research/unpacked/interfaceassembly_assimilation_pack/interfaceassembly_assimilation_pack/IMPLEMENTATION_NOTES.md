# Implementation Notes

This pack is designed to be copied into the root of `soboltoshi/interfaceassembly`.

## Suggested merge order

1. `world/proposals/2026-04-01-assembly-assimilation-box.md`
2. `world/clauses/AssemblyAssimilationBox.md`
3. `world/interfaces/AssimilationContract.md`
4. `world/registries/assimilation-registry.md`
5. `agents/assimilation/README.md`
6. `hub/assembly-assimilation.md`
7. `.claude/skills/assimilation/SKILL.md`
8. `.codex/skills/assimilation/SKILL.md`
9. `world/amendments/2026-04-01-add-assembly-assimilation-box.md`

## README changes to apply manually

Add `AssemblyAssimilationBox` to the list of first-class boxes.

Add a new slash-skill style line for assimilation, for example:

`/assimilate <source>`: translate an external repo, local folder, or service into Interface Assembly language and emit adoption material.

Add `agents/assimilation/` to the repository structure section.

## Gotchas

- Keep assimilation as a translator, not as a replacement for WorldBuilder.
- Do not let assimilation automatically promote foreign repos into native world truth.
- Keep shared payload shape in `world/interfaces/AssimilationContract.md` so other boxes can depend on it neutrally.
- If you later assimilate MiroFish, place it under `world/adapters/` as an adapter record, not inside the core assimilation skill.
