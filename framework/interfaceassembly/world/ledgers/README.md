# Ledgers

The assembly uses several durable ledgers instead of hidden chat state.

## Ledgers

- `world/amendments/`
  - accepted structural changes
- `world/proposals/`
  - intake before classification
- `agents/blockbuilder/reports/`
  - scoped local reports
- `agents/arbiter/conflicts/`
  - open and resolved contradictions
- `agents/arbiter/decisions/`
  - recurring or ratified conflict outcomes
- `agents/worldbuilder/log/`
  - full system reviews
- `agents/worldbuilder/decisions/`
  - final shape decisions
- `agents/public-readiness/reports/`
  - release-gate outcomes
