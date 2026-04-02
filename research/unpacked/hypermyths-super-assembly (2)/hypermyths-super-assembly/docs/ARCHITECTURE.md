# Architecture

## Priority: computation markets

This repo treats computation as a market.

### Supply side

A node advertises:

- node id
- role
- available minutes
- price floor per minute
- reliability score
- whether it is private or public

### Demand side

A job advertises:

- job id
- customer / agent owner
- requested minutes
- max budget
- urgency
- required trust level
- desired node role

### Market engine

The engine does four simple things first:

1. filter nodes that can satisfy a job
2. quote each viable route
3. sort quotes by score
4. turn winning quotes into fills and settlement receipts

## Why the private superbrain still exists

The superbrain is not the market. It is the high-level routing and policy advisor.

It can:

- raise or lower urgency premiums
- prefer private nodes for sensitive jobs
- cap risky nodes
- suggest reserve prices
- suggest rejection when the market looks irrational

## Interfaces

### CLI
For scripting, debugging, JSON export, and automation.

### TUI
For live local operator control.

### Web GUI
For richer dashboard views and later wallet / Solana panels.

## Solana-first integration path

Phase 1 is local-only.

Phase 2 adds Solana adapters for:

- quote commitment
- settlement receipts
- node staking or reputation proofs
- governance hooks

Keep chain logic outside the core market engine until the local market works.
