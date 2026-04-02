# HyperMythX Combined SuperAssembly Starter

This starter repo combines the constitutional Interface Assembly layer with the executable SuperAssembly layer.

## What changed in this version

- real **Next.js App Router** web shell in `apps/web`
- existing JS supernode and VR shell kept as local bootstraps
- added **Rust** native component in `native/supernode-rs`
- added **C** native component in `native/c-runtime`
- locked **69 adapters**
- keeps **ASIMOG** as the builder-governance shell
- keeps the **VR Superbrain separate** from the desktop execution agent

## Tools you need

- **VS Code**
- **Node.js 20+**
- **pnpm**
- **Rust + Cargo**
- **CMake**
- a C compiler such as **clang** or **gcc**

## How to run

### 1. Web app
Run in the repo root:

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

### 2. JS supernode bootstrap
Run in a second terminal from the repo root:

```bash
pnpm start:supernode
```

### 3. VR shell bootstrap
Run in a third terminal from the repo root:

```bash
pnpm start:vr
```

### 4. Rust native component
Run in the repo root:

```bash
pnpm build:rust
pnpm run:rust
```

### 5. C native component
Run in the repo root:

```bash
pnpm build:c
pnpm run:c
```

## Gotchas

- Next.js is now real, but the app is still a starter shell.
- Rust and C are scaffolded as native runtime lanes, not yet fully bound into the JS control plane.
- Do not put secrets into client-side code.
- Do not move canonical state logic into React components.
