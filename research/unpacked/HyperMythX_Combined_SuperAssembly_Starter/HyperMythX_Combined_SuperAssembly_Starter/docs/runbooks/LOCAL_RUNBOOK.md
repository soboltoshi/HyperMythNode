
# Local Runbook

## Tools needed
- VS Code
- Node.js 20+
- npm

## Commands
Run in repo root:

```bash
npm install
npm run start:supernode
```

In a new terminal:

```bash
npm run dev
```

Optional VR shell:

```bash
npm run start:vr
```

## Gotchas
- `npm install` is mostly for future workspace growth; this starter uses built-in Node modules.
- The web server is plain Node HTTP, not full Next.js yet.
- The desktop agent bridge is simulated and logs actions rather than executing real chain operations.
