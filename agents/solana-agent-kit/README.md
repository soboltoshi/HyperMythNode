# Solana Agent Kit Bridge

Shared Solana capability bridge for the assembly world.

## Upstream reference

- `external/solana-agent-kit`
- `https://github.com/sendaifun/solana-agent-kit`

## What it exposes

- local status and capability manifest
- HTTP action bridge for installed Solana Agent Kit actions
- stdio MCP mode for agents that speak MCP
- default token + NFT plugin stack, with heavier plugins left optional at runtime

## Required env

- `RPC_URL` or `SOLANA_RPC_URL`
- `SOLANA_PRIVATE_KEY` as base58, hex, or JSON byte array
- optional `OPENAI_API_KEY`

## Commands

```bash
npm --workspace agents/solana-agent-kit run status
npm --workspace agents/solana-agent-kit run serve
npm --workspace agents/solana-agent-kit run mcp
```
