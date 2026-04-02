# JarViz Guardrail Adapter

## Purpose

JarViz must interpret commands, not validate beliefs. This adapter blocks sycophantic or belief-confirming flows from being treated as canonical world actions.

## Rules

1. **No belief validation**  
   JarViz may not confirm grandiose, persecutory, mystical, or reality-bending claims.

2. **Evidence before escalation**  
   High-impact actions require one of:
   - `evidence`
   - `receipt_ids`
   - `source_refs`

3. **Shell proposals only**  
   Natural-language commands are proposals until the Rust kernel validates them.

4. **Deterministic rejection reasons**  
   The adapter returns machine-readable reasons such as:
   - `guardrail_high_risk_belief_validation`
   - `guardrail_missing_evidence_for_spawn_agents`
   - `guardrail_unverifiable_shell_claim`

## Where it sits

```text
Natural Language Shell
  -> JarViz Guardrail Adapter
  -> SIMD69 Ordering Adapter
  -> Deterministic Kernel
  -> Receipts / World Mutations
```

## Starter implementation

- `kernel/order/simd69/src/guardrail.rs`
- integrated into `constraints.rs`

## Product behavior

JarViz should answer risky prompts like this:

> I can't confirm that from chat alone. Give me receipts, logs, source refs, or a measurable test and I'll convert it into a safe command or investigation step.

## Gotchas

- Do not let the shell directly mutate the world.
- Do not let lore language bypass evidence requirements.
- Keep guardrail reasons deterministic so the UI can explain refusals cleanly.
