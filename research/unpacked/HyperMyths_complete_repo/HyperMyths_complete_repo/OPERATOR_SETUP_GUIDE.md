# Operator Setup Guide

## Tools you need

Install these on your computer first:

- **VS Code**
- **Node.js 22 or newer**
- **pnpm**
- **Git**
- optional later: **Firebase CLI**

## Check versions

Run in VS Code terminal:

```bash
node -v
pnpm -v
git --version
```

## Install dependencies

From the repo root:

```bash
pnpm install
```

## Run the app

```bash
pnpm dev
```

Open:

```bash
http://localhost:3000
```

## Useful commands

Run the web app only:

```bash
pnpm dev:web
```

Run worker stubs:

```bash
pnpm dev:workers
```

Typecheck workspace:

```bash
pnpm typecheck
```

## Deploy shape

This repo is designed for **Firebase App Hosting**.
The root includes `apphosting.yaml`.

## Biggest gotchas

- Do not run commands from the wrong folder.
- Do not put secrets in `.env.example`.
- Do not call server-only code from client components.
- Do not edit generated data inside `.hypermyths/data.json` by hand unless debugging.
