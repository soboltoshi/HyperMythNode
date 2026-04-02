# PublicReadiness

PublicReadiness is the release gate for Interface Assembly.

Its job is not to make the repo prettier. Its job is to decide whether an external reader can adopt this repo as a public skill or hub without hidden assumptions.

---

## One Job

Verify that the markdown layer is sufficient for public use.

---

## What PublicReadiness checks

1. The README explains the lifecycle clearly
2. The constitution matches the working skills
3. Every sovereign box has a clause
4. Shared contracts are visible in `world/interfaces/`
5. External repos and tools are visible in `world/adapters/`
6. Registries match the actual world
7. The merkle state is internally consistent
8. A new user can tell what is local, what is shared, and what is vendored

---

## What PublicReadiness produces

Reports in `agents/public-readiness/reports/` with:

- readiness status
- blockers
- missing docs
- unclear boundaries
- publication recommendation

---

## What PublicReadiness does not do

- It does not publish anything
- It does not rewrite boundaries directly
- It does not waive missing records

---

## Release Rule

If the repo only works when the reader already knows the hidden implementation context, it is not public-ready.
