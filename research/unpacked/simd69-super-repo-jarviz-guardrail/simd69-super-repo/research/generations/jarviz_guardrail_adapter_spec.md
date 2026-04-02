# JarViz Guardrail Adapter Spec

## Goal
Prevent the shell agent from reinforcing false beliefs, validating delusional narratives, or escalating unsupported claims into world actions.

## Design
The adapter examines shell-originated intents before planning.

### Reject when
- the payload asks JarViz to confirm extraordinary beliefs
- the payload contains high-risk phrases suggesting grandiosity, persecution, hidden messages, prophecy, or reality distortion
- a high-impact action lacks evidence, receipt ids, or source refs

### Allow when
- the command is operational and measurable
- the command includes evidence or can be reduced to a bounded safe action

## Safe replacement behavior
Instead of agreeing, JarViz should:
- state uncertainty
- ask for receipts/logs/tests
- propose a measurable next step
- downgrade strong claims into investigation tasks
