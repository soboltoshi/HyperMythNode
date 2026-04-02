
# HyperMythX Combined SuperAssembly Starter

This is the locked starter repo for building HyperMythX as one constitutional super-repo.

It combines:
- Interface Assembly law
- charter and constitution
- block coding rules
- 69 locked adapters
- ASIMOG builder governance shell
- separate VR Superbrain shell and desktop-agent bridge
- Quest submission-readiness tracking for later release
- starter runnable web + supernode + VR services

## Core law

```text
Digital Activity -> Canonical Session State -> Interpretation Layer -> Output
```

## Runtime split

- **Desktop Agent** controls crypto, wallets, devices, and execution.
- **VR Superbrain** is separate and talks to the desktop agent through a bridge contract.
- **ASIMOG Agent** governs build discipline, repo change review, and assembly integrity.

## Quick start

Run these in **VS Code terminal** from the repo root:

```bash
npm install
npm run start:supernode
```

In a second terminal:

```bash
npm run dev
```

In a third terminal for the VR shell:

```bash
npm run start:vr
```

Open `http://localhost:3000`.
