# Research Summary

This folder contains generated research notes used to shape the SIMD69 adapter.

## Main conclusions

1. The best architecture is **Rust core + Lua scripting + TypeScript NL shell**.
2. Lua remains a strong fit for lightweight procedural generation and fast gameplay iteration.
3. Rust should own canonical truth, receipts, ordering, and deterministic fallback.
4. The ordering adapter should remain proposal-oriented: optimizer search suggests, kernel verifies, fallback guarantees liveness.
5. A bounded 42×42×42 world is small enough to make procedural rules legible and deterministic.
