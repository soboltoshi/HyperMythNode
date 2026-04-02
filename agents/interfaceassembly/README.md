# Agents

These are the named roles in the Interface Assembly world.

Some are constitutional authorities. Some are scoped workers. Some are vendored tools that support the authorities.

---

## Constitutional Agents

- `archivist/`
  - records accepted structure
  - writes amendments
  - maintains merkle state

- `arbiter/`
  - resolves conflicts
  - proposes minimum coherent changes

- `worldbuilder/`
  - classifies new work
  - decides whether something is a box, interface, adapter, or sidecar
  - ratifies final boundary shape

- `public-readiness/`
  - runs the final release gate before the repo is published as a public skill or hub

---

## Scoped Worker Agent

- `blockbuilder/`
  - one instance per accepted block, repo, or feature
  - owns local role definition and local reports only
  - cannot directly mutate another block

---

## Vendored Support Tools

- `vendor/g0dm0d3-upstream/`
  - multi-model evaluator

- `vendor/hermes-agent/`
  - memory and delegation surface

The vendored tools are capabilities. They do not outrank the constitutional agents.
