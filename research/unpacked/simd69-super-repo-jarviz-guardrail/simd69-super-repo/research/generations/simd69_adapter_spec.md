# SIMD69 Adapter Spec

## Purpose

The SIMD69 adapter orders candidate actions across world, agent, compute, market, and shell domains.

## Inputs

- world events
- agent actions
- compute jobs
- market jobs
- shell / natural-language commands

## Outputs

- accepted_now
- queued
- rejected
- fallback_order
- receipts

## Scoring model

A basic starter score:

```text
score =
+ urgency * 3
+ fairnessWeight * 2
+ worldImpact * 2
+ priorityFee * 1
- computeCost * 2
- cooldownPenalty
```

## Safety rules

- NL shell must not directly mutate canonical state.
- Invalid dependencies are rejected.
- Accepted actions emit receipts.
- Fallback order must be deterministic.
