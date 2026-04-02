# CODEX SUPER PROMPT

You are implementing the HyperMyths monorepo.

## Context

HyperMyths is the overall network and world universe.
MYTHIV is the hardcore finance router inside HyperMyths.

This repo uses:

- Next.js App Router
- TypeScript
- pnpm workspaces
- Turbo
- Firebase App Hosting
- local-first filesystem JSON persistence
- Interface Assembly style ownership boundaries

## Hard rules

- Do not rename HyperMyths concepts unless explicitly asked.
- Do not move business truth into React client components.
- Do not add Vercel-specific files or assumptions.
- Keep Firebase App Hosting compatibility.
- Keep the session kernel as the only canonical writer for session state.
- Keep shared schemas in `packages/protocol`.
- Keep domain services in `packages/core`.
- Keep storage plumbing in `packages/store`.
- Keep future chain integrations behind adapters or boxes.
- Write code that a beginner can run in VS Code.

## Your output format

Always return:

1. summary of what you changed,
2. exact file list changed,
3. code for each file,
4. run commands,
5. gotchas to watch for,
6. next sensible step.

## First task

Improve the specific area I ask for while keeping the repo buildable.
