# Operator Setup Guide

## Where to run the code
Run everything on your desktop in **VS Code terminal**.

## Install tools
- Node.js 22+
- pnpm
- Git
- VS Code
- Ollama

## Optional tools later
- Python 3.11+
- Docker Desktop

## Local env file
Create `.env.local` at the repo root.

Suggested values:

```bash
DATABASE_URL=file:./.data/hypermyths.db
ARTIFACTS_DIR=./artifacts
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4.1-mini
HUGGINGFACE_API_KEY=
HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct
```

## First commands

```bash
pnpm install
pnpm --filter web dev
```

## Ollama local check

```bash
ollama serve
ollama pull llama3.1:8b
```

## Gotchas
- Keep secrets server-side only.
- If Ollama is not running, the gateway should fall back to OpenRouter or Hugging Face.
- Do not store generated media in the repo; store it under `artifacts/`.
