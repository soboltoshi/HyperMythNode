# Session kernel prompt

Implement the next real version of SessionKernel.

Requirements:
- authoritative single-writer mutation path
- lease expiry helpers
- replay protection key registry
- append-only mutation log
- safer transition validation
- testable pure functions where possible

Do not move state authority into React.
Keep route handlers thin.
