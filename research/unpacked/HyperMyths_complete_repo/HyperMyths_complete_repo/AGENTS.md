# AGENTS

## Local operator rules

- Use **VS Code**.
- Use **pnpm**.
- Use **Node.js 22+**.
- Deploy to **Firebase App Hosting only**.
- Keep secrets out of client code.
- Use `packages/core` for business rules.
- Use `packages/store` for local persistence.
- Use `packages/protocol` for shared data contracts.
- Keep adapters thin.
- Keep the session kernel authoritative.

## Codex handoff rule

When you paste a successor prompt into Codex, tell it to:

1. preserve folder names,
2. avoid renaming HyperMyths concepts,
3. avoid moving truth into the browser,
4. prefer additive changes,
5. document every changed file,
6. keep Firebase App Hosting compatibility.
